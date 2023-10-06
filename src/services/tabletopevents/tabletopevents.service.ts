import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom, map } from 'rxjs';

@Injectable()
export class TabletopeventsService {
  tteApiUrl = 'https://tabletop.events/api/';
  sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

  constructor(private readonly httpService: HttpService) {}

  async getSession(userName: string, password: string, apiKey: string) {
    const session = await lastValueFrom(
      this.httpService
        .post(this.tteApiUrl + `session`, {
          username: userName,
          password: password,
          api_key_id: apiKey,
        })
        .pipe(map((resp) => resp.data)),
    );

    this.sleep(1000);

    return session;
  }

  async getBadges(tteConventionId: string, session: any) {
    const badges: any[] = [];

    let badgePage = await lastValueFrom(
      this.httpService
        .get(
          this.tteApiUrl +
            `convention/${tteConventionId}/badges?session_id=${session.session_id}`,
        )
        .pipe(map((resp) => resp.data)),
    );

    for (let i = 0; i < badgePage.result.paging.total_pages; i++) {
      badges.push(...badgePage.result.items);

      await this.sleep(1000);

      badgePage = await lastValueFrom(
        this.httpService
          .get(
            this.tteApiUrl +
              `convention/${tteConventionId}/badges?session_id=${session.session_id}`,
          )
          .pipe(map((resp) => resp.data)),
      );
    }

    return badges;
  }

  async getBadgeTypes(tteConventionId: string, session: any) {
    const badgeTypes: any[] = [];

    let badgeTypePage = await lastValueFrom(
      this.httpService
        .get(
          this.tteApiUrl +
            `convention/${tteConventionId}/badgetypes?session_id=${session.session_id}`,
        )
        .pipe(map((resp) => resp.data)),
    );

    for (let i = 0; i < badgeTypePage.result.paging.total_pages; i++) {
      badgeTypes.push(...badgeTypePage.result.items);

      await this.sleep(1000);

      badgeTypePage = await lastValueFrom(
        this.httpService
          .get(
            this.tteApiUrl +
              `convention/${tteConventionId}/badgetypes?session_id=${session.session_id}`,
          )
          .pipe(map((resp) => resp.data)),
      );
    }

    return badgeTypes;
  }
}
