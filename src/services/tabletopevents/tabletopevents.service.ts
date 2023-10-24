import { HttpService } from 'nestjs-http-promise';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TabletopeventsService {
  tteApiUrl = 'https://tabletop.events/api/';
  sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

  constructor(private readonly httpService: HttpService) {}

  async getSession(
    userName: string,
    password: string,
    apiKey: string,
  ): Promise<any> {
    return new Promise(async (resolve) => {
      const session = await this.httpService.post(this.tteApiUrl + `session`, {
        username: userName,
        password: password,
        api_key_id: apiKey,
      });

      await this.sleep(1000);

      return resolve(session?.data?.result?.id);
    });
  }

  async getBadges(tteConventionId: string, session: any): Promise<any> {
    return new Promise(async (resolve) => {
      const badges: any[] = [];

      let badgePage = await this.httpService.get(
        this.tteApiUrl +
          `convention/${tteConventionId}/badges?session_id=${session}`,
      );

      badges.push(...badgePage.data.result.items);

      await this.sleep(1000);

      for (let i = 2; i <= badgePage.data.result.paging.total_pages; i++) {
        badgePage = await this.httpService.get(
          this.tteApiUrl +
            `convention/${tteConventionId}/badges?session_id=${session}&_page_number=${i}`,
        );

        badges.push(...badgePage.data.result.items);

        await this.sleep(1000);
      }

      return resolve(badges);
    });
  }

  async getBadgeTypes(tteConventionId: string, session: any): Promise<any> {
    return new Promise(async (resolve) => {
      const badgeTypes: any[] = [];

      let badgeTypePage = await this.httpService.get(
        this.tteApiUrl +
          `convention/${tteConventionId}/badgetypes?session_id=${session}`,
      );

      badgeTypes.push(...badgeTypePage.data.result.items);

      await this.sleep(1000);

      for (let i = 2; i <= badgeTypePage.data.result.paging.total_pages; i++) {
        badgeTypePage = await this.httpService.get(
          this.tteApiUrl +
            `convention/${tteConventionId}/badgetypes?session_id=${session}&_page_number=${i}`,
        );

        badgeTypes.push(...badgeTypePage.data.result.items);

        await this.sleep(1000);
      }

      return resolve(badgeTypes);
    });
  }
}
