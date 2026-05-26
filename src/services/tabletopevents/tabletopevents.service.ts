import { HttpService } from 'nestjs-http-promise';
import { Injectable } from '@nestjs/common';
import { RuleslawyerLogger } from '../../utils/ruleslawyer.logger';

@Injectable()
export class TabletopeventsService {
  tteApiUrl = 'https://tabletop.events/api/';
  private readonly logger: RuleslawyerLogger = new RuleslawyerLogger(
    TabletopeventsService.name,
  );
  sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

  constructor(private readonly httpService: HttpService) {}

  async getSession(
    userName: string,
    password: string,
    apiKey: string,
  ): Promise<any> {
    this.logger.log(`Getting TTE session for userName=${userName}`);
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
        this.logger.log(
          `Getting badge with tteBadgeId=${tteBadgeId}, tteBadgeNumber=${tteBadgeNumber}, tteConventionId=${tteConventionId}`,
        );
        const badge = await this.httpService.get(
          this.tteApiUrl + `badge/${tteBadgeId}?session_id=${session}`,
        );

        if (
          badge.data.result.badge_number === tteBadgeNumber &&
          badge.data.result.convention_id === tteConventionId
        ) {
          this.logger.log(
            `Got badge with tteBadgeId=${tteBadgeId}, tteBadgeNumber=${tteBadgeNumber}, tteConventionId=${tteConventionId}`,
          );
          return resolve(badge.data.result);
        } else {
          this.logger.error(
            `Failed to get badge with tteBadgeId=${tteBadgeId}, tteBadgeNumber=${tteBadgeNumber}, tteConventionId=${tteConventionId}`,
          );
          return resolve(null);
        }
      } catch (ex) {
        this.logger.error(
          `Failed to get badge with tteBadgeId=${tteBadgeId}, tteBadgeNumber=${tteBadgeNumber}, tteConventionId=${tteConventionId}, ex=${ex}`,
        );
        return reject(ex);
      }
    });
  }

  async getBadges(tteConventionId: string, session: any): Promise<any[]> {
    return new Promise(async (resolve, reject) => {
      const badges: any[] = [];
      try {
        let totalPages = 1;
        for (let i = 1; i <= totalPages; i++) {
          if (i % 10 === 0) {
            this.logger.log(
              `Status Update: Getting badge list for tteConventionId=${tteConventionId}, page ${i} of ${totalPages}`,
            );
          }

          const badgePage = await this.httpService.get(
            this.tteApiUrl +
              `convention/${tteConventionId}/badges?session_id=${session}&_page_number=${i}&_items_per_page=100`,
          );

          badges.push(...badgePage.data.result.items);
          totalPages = badgePage.data.result.paging.total_pages;

          if (i < totalPages) await this.sleep(1000);
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

      let totalPages = 1;
      for (let i = 1; i <= totalPages; i++) {
        const badgeTypePage = await this.httpService.get(
          this.tteApiUrl +
            `convention/${tteConventionId}/badgetypes?session_id=${session}&_page_number=${i}&_items_per_page=100`,
        );

        badgeTypes.push(...badgeTypePage.data.result.items);
        totalPages = badgeTypePage.data.result.paging.total_pages;

        if (i < totalPages) await this.sleep(1000);
      }

      return resolve(badgeTypes);
    });
  }

  async getSoldProducts(badgeId: string, session: any): Promise<any[]> {
    return new Promise(async (resolve, reject) => {
      const soldProducts: any[] = [];
      try {
        let totalPages = 1;
        for (let i = 1; i <= totalPages; i++) {
          const soldProductsPage = await this.httpService.get(
            this.tteApiUrl +
              `badge/${badgeId}/soldproducts?session_id=${session}&_page_number=${i}&_include_related_objects=productvariant`,
          );

          soldProducts.push(...soldProductsPage.data.result.items);
          totalPages = soldProductsPage.data.result.paging.total_pages;

          if (i < totalPages) await this.sleep(1000);
        }

        return resolve(soldProducts);
      } catch (ex) {
        return reject(ex);
      }
    });
  }

  // Fetches every sold product for a convention in one paginated sweep
  // (100/page) instead of one request per badge. Each item carries a
  // badge_id, so callers can group results by badge locally. This turns a
  // ~3000-request import into ~30-90 requests under TTE's 1 req/sec limit.
  async getConventionSoldProducts(
    tteConventionId: string,
    session: any,
  ): Promise<any[]> {
    return new Promise(async (resolve, reject) => {
      const soldProducts: any[] = [];
      try {
        let totalPages = 1;
        for (let i = 1; i <= totalPages; i++) {
          if (i % 10 === 0) {
            this.logger.log(
              `Status Update: Getting sold products for tteConventionId=${tteConventionId}, page ${i} of ${totalPages}`,
            );
          }

          const soldProductsPage = await this.httpService.get(
            this.tteApiUrl +
              `convention/${tteConventionId}/soldproducts?session_id=${session}&_page_number=${i}&_items_per_page=100&_include_related_objects=productvariant`,
          );

          soldProducts.push(...soldProductsPage.data.result.items);
          totalPages = soldProductsPage.data.result.paging.total_pages;

          if (i < totalPages) await this.sleep(1000);
        }

        return resolve(soldProducts);
      } catch (ex) {
        return reject(ex);
      }
    });
  }
}
