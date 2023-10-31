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

  async getBadge(
    tteConventionId: string,
    tteBadgeNumber: number,
    tteBadgeId: string,
    session: any,
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        const badge = await this.httpService.get(
          this.tteApiUrl + `badge/${tteBadgeId}?session_id=${session}`,
        );

        if (
          badge.data.result.badge_number === tteBadgeNumber &&
          badge.data.result.convention_id === tteConventionId
        ) {
          return resolve(badge.data.result);
        } else {
          return resolve(null);
        }
      } catch (ex) {
        return reject(ex);
      }
    });
  }

  async getBadges(tteConventionId: string, session: any): Promise<any[]> {
    return new Promise(async (resolve, reject) => {
      const badges: any[] = [];
      try {
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
      } catch (ex) {
        return reject(ex);
      }
    });
  }

  async getBadgeTypes(tteConventionId: string, session: any): Promise<any[]> {
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

  async getSoldProducts(badgeId: string, session: any): Promise<any[]> {
    return new Promise(async (resolve, reject) => {
      const soldProducts: any[] = [];
      try {
        let soldProductsPage = await this.httpService.get(
          this.tteApiUrl +
            `badge/${badgeId}/soldproducts?session_id=${session}&_include_related_objects=productvariant`,
        );

        soldProducts.push(...soldProductsPage.data.result.items);

        await this.sleep(1000);

        for (
          let i = 2;
          i <= soldProductsPage.data.result.paging.total_pages;
          i++
        ) {
          soldProductsPage = await this.httpService.get(
            this.tteApiUrl +
              `badge/${badgeId}/soldproducts?session_id=${session}&_page_number=${i}&_include_related_objects=productvariant`,
          );

          soldProducts.push(...soldProductsPage.data.result.items);

          await this.sleep(1000);
        }

        return resolve(soldProducts);
      } catch (ex) {
        return reject(ex);
      }
    });
  }
}
