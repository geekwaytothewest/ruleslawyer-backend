import { HttpService } from 'nestjs-http-promise';
import { Injectable } from '@nestjs/common';
import { RuleslawyerLogger } from '../../utils/ruleslawyer.logger';
import { XMLParser } from 'fast-xml-parser';

@Injectable()
export class BoardGameGeekService {
  bggApiUrl = 'https://boardgamegeek.com/xmlapi2/';
  private readonly xmlParser = new XMLParser({ ignoreAttributes: false, isArray: (name) => name === 'item' });

  private readonly logger: RuleslawyerLogger = new RuleslawyerLogger(
    BoardGameGeekService.name,
  );

  sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

  constructor(private readonly httpService: HttpService) {}

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
