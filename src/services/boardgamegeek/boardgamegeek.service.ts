import { HttpService } from 'nestjs-http-promise';
import { Injectable } from '@nestjs/common';
import { RuleslawyerLogger } from '../../utils/ruleslawyer.logger';
import { XMLParser } from 'fast-xml-parser';
import { parse } from 'csv-parse/sync';
import AdmZip from 'adm-zip';

export interface RankDumpEntry {
  id: number;
  year: number | null;
  rank: number | null;
}

/**
 * Normalizes a game name for fuzzy matching against the BGG rank dump:
 * lowercases, strips diacritics and punctuation, drops a leading article,
 * and collapses whitespace. Used on both the dump names and our own names.
 */
export function normalizeBggName(name: string): string {
  return (name ?? '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/^(the|a|an)\s+/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

@Injectable()
export class BoardGameGeekService {
  bggApiUrl = 'https://boardgamegeek.com/xmlapi2/';
  private readonly xmlParser = new XMLParser({ ignoreAttributes: false, isArray: (name) => name === 'item' });

  private readonly logger: RuleslawyerLogger = new RuleslawyerLogger(
    BoardGameGeekService.name,
  );

  sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

  constructor(private readonly httpService: HttpService) {}

  async getBoardGameBatchByBGGIds(
    bggIds: number[],
  ): Promise<any[]> {
    if (bggIds.length === 0) {
      return [];
    }

    if (bggIds.length > 20) {
      this.logger.warn(
        `Batch request for boardgames with bggIds=${bggIds} exceeds BoardGameGeek API limit of 20 IDs per request.`,
      );

      throw new Error('Batch request exceeds BoardGameGeek API limit of 20 IDs per request.');
    }

    try {
      const response = await this.httpService.get(
        this.bggApiUrl + `thing?id=${bggIds.join(',')}&type=boardgame`,
        { headers: { Authorization: `Bearer ${process.env.BOARDGAMEGEEK_API_TOKEN}` } },
      );

      const parsed = this.xmlParser.parse(response.data);
      const items = parsed.items?.item ?? [];

      this.logger.log(
        `Successfully retrieved ${items.length} boardgame(s) for bggIds=${bggIds.join(',')} from BoardGameGeek API.`,
      );

      return items;
    } catch (error: any) {
      this.logger.error(
        `Error retrieving boardgames with bggIds=${bggIds.join(',')} from BoardGameGeek API: ${error.message}`,
      );

      return [];
    }
  }

  async getBoardGameByBGGId(
    bggId: number,
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        this.logger.log(
          `Getting boardgame with bggId=${bggId} from BoardGameGeek API...`,
        );
        const game = await this.httpService.get(
          this.bggApiUrl + `thing?id=${bggId}&type=boardgame`,
          { headers: { Authorization: `Bearer ${process.env.BOARDGAMEGEEK_API_TOKEN}` } },
        );

        const parsed = this.xmlParser.parse(game.data);
        const items = parsed.items?.item ?? [];

        if (items.length === 0) {
          this.logger.warn(
            `No boardgame found with bggId=${bggId} from BoardGameGeek API.`,
          );
          return resolve(null);
        } else {
          this.logger.log(
            `Successfully retrieved boardgame with bggId=${bggId} from BoardGameGeek API.`,
          );

          return resolve(items[0]);
        }
      } catch (error: any) {
        this.logger.error(
          `Error retrieving boardgame with bggId=${bggId} from BoardGameGeek API: ${error.message}`,
        );
        return reject(error);
      }
    });
  }

  async getBoardGameIdByName(
    name: string,
  ): Promise<number | null> {
    return new Promise(async (resolve, reject) => {
      try {
        this.logger.log(
          `Getting boardgame with name=url${name} from BoardGameGeek API...`,
        );
        const game = await this.httpService.get(
          this.bggApiUrl + `search?query=${encodeURIComponent(name)}&type=boardgame`,
          { headers: { Authorization: `Bearer ${process.env.BOARDGAMEGEEK_API_TOKEN}` } },
        );

        const parsed = this.xmlParser.parse(game.data);
        const items = parsed.items?.item ?? [];

        if (items.length === 0) {
          this.logger.warn(
            `No boardgame found with name=${name} from BoardGameGeek API.`,
          );
          return resolve(null);
        }

        resolve(parseInt(items[0]['@_id']));
      } catch (error: any) {
        this.logger.error(
          `Error retrieving boardgame with name=${name} from BoardGameGeek API: ${error.message}`,
        );
        reject(error);
      }
    });
  }

  /**
   * Downloads the BGG `bg_ranks` data dump zip from a (signed, expiring) URL,
   * extracts the CSV, and builds a normalized-name -> entries index so game
   * names can be resolved to bggIds locally, without per-game search calls.
   */
  async getRankDumpIndex(
    dumpUrl: string,
  ): Promise<Map<string, RankDumpEntry[]>> {
    this.logger.log('Downloading BoardGameGeek rank data dump...');

    const response = await this.httpService.get(dumpUrl, {
      responseType: 'arraybuffer',
    });

    const zip = new AdmZip(Buffer.from(response.data));
    const csvEntry = zip
      .getEntries()
      .find((entry) => entry.entryName.toLowerCase().endsWith('.csv'));

    if (!csvEntry) {
      throw new Error('No CSV file found in BoardGameGeek rank data dump.');
    }

    const records: Record<string, string>[] = parse(csvEntry.getData(), {
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true,
    });

    const index = new Map<string, RankDumpEntry[]>();

    for (const row of records) {
      const id = parseInt(row.id);
      if (!id) {
        continue;
      }

      const key = normalizeBggName(row.name);
      if (!key) {
        continue;
      }

      const entry: RankDumpEntry = {
        id,
        year: parseInt(row.yearpublished) || null,
        rank: parseInt(row.rank) || null,
      };

      const existing = index.get(key);
      if (existing) {
        existing.push(entry);
      } else {
        index.set(key, [entry]);
      }
    }

    this.logger.log(
      `Loaded ${records.length} rows (${index.size} distinct names) from BoardGameGeek rank data dump.`,
    );

    return index;
  }

  async getImage(url: string): Promise<Buffer | null> {
    try {
      const response = await this.httpService.get(url, { responseType: 'arraybuffer' });
      return Buffer.from(response.data);
    } catch (error: any) {
      this.logger.error(`Error fetching image from ${url}: ${error.message}`);
      return null;
    }
  }
}
