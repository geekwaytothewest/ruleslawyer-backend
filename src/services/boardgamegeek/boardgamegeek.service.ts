import { HttpService } from 'nestjs-http-promise';
import { Injectable } from '@nestjs/common';
import { RuleslawyerLogger } from '../../utils/ruleslawyer.logger';
import { XMLParser } from 'fast-xml-parser';
import { parse } from 'csv-parse/sync';
import AdmZip = require('adm-zip');

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

  // Adaptive inter-request throttle (step 5). 429s push the recommended delay
  // up multiplicatively; clean responses ease it back down (AIMD). Callers that
  // pace a loop (e.g. the bulk sync) read `throttleDelayMs` between requests.
  private static readonly BASE_DELAY_MS = 1000;
  private static readonly MAX_DELAY_MS = 8000;
  private static readonly DECAY_STEP_MS = 250;
  private throttleMs = BoardGameGeekService.BASE_DELAY_MS;

  /** Current recommended delay between requests, raised after recent 429s. */
  get throttleDelayMs(): number {
    return this.throttleMs;
  }

  /** Reset the adaptive throttle to its baseline (call at the start of a run). */
  resetThrottle(): void {
    this.throttleMs = BoardGameGeekService.BASE_DELAY_MS;
  }

  private noteRateLimited(): void {
    this.throttleMs = Math.min(
      Math.round(this.throttleMs * 1.5),
      BoardGameGeekService.MAX_DELAY_MS,
    );
    this.logger.warn(
      `BGG rate-limited (429); raising inter-request delay to ${this.throttleMs}ms for the rest of the run.`,
    );
  }

  private noteSuccess(): void {
    if (this.throttleMs > BoardGameGeekService.BASE_DELAY_MS) {
      this.throttleMs = Math.max(
        BoardGameGeekService.BASE_DELAY_MS,
        this.throttleMs - BoardGameGeekService.DECAY_STEP_MS,
      );
    }
  }

  /** Backoff for one retry: honor Retry-After if present, else exponential. */
  private retryDelayMs(error: any, attempt: number, baseDelayMs: number): number {
    const retryAfter = error?.response?.headers?.['retry-after'];
    if (retryAfter !== undefined) {
      const seconds = Number(retryAfter);
      if (!Number.isNaN(seconds)) {
        return Math.max(0, seconds * 1000);
      }
      const dateMs = Date.parse(retryAfter);
      if (!Number.isNaN(dateMs)) {
        return Math.max(0, dateMs - Date.now());
      }
    }
    return baseDelayMs * 2 ** attempt;
  }

  /**
   * GETs a BGG xmlapi2 URL, transparently handling the two transient responses
   * BGG returns under load:
   *   - 202 "queued": a 2xx; the result isn't built yet. Retry with backoff;
   *     after retries, return the (empty) response but log a distinct warning.
   *   - 429 "rate limited": a thrown 4xx. Retry honoring Retry-After (else
   *     exponential backoff) and bump the adaptive throttle; after retries,
   *     re-throw so the caller's existing error handling stands.
   * Any other error is re-thrown unchanged.
   */
  private async getWithRetry(
    url: string,
    config: any,
    maxRetries = 4,
    baseDelayMs = 1000,
  ): Promise<any> {
    for (let attempt = 0; ; attempt++) {
      let response: any;
      try {
        response = await this.httpService.get(url, config);
      } catch (error: any) {
        if (error?.response?.status === 429) {
          this.noteRateLimited();
          if (attempt < maxRetries) {
            const delay = this.retryDelayMs(error, attempt, baseDelayMs);
            this.logger.log(
              `BGG 429 (rate limited) for ${url}; retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries}).`,
            );
            await this.sleep(delay);
            continue;
          }
          this.logger.warn(
            `BGG still 429 (rate limited) after ${maxRetries} retries for ${url}; giving up.`,
          );
        }
        throw error;
      }

      if (response.status !== 202) {
        this.noteSuccess();
        return response;
      }

      if (attempt >= maxRetries) {
        this.logger.warn(
          `BGG still returning 202 (queued) after ${maxRetries} retries for ${url}; giving up.`,
        );
        return response;
      }

      const delay = baseDelayMs * 2 ** attempt;
      this.logger.log(
        `BGG returned 202 (queued) for ${url}; retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries}).`,
      );
      await this.sleep(delay);
    }
  }

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
      const response = await this.getWithRetry(
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
        const game = await this.getWithRetry(
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
        const game = await this.getWithRetry(
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
