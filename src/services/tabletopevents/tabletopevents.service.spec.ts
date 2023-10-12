import { Test, TestingModule } from '@nestjs/testing';
import { TabletopeventsService } from './tabletopevents.service';
import { HttpModule } from 'nestjs-http-promise';
import { AxiosResponse } from 'axios';
import { createMock } from '@golevelup/ts-jest';

describe('TabletopeventsService', () => {
  let service: TabletopeventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [TabletopeventsService],
    }).compile();

    service = module.get<TabletopeventsService>(TabletopeventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSession', () => {
    it('should fail to get a session', async () => {
      const response = createMock<AxiosResponse>({ data: undefined });

      jest
        .spyOn(service['httpService'], 'post')
        .mockResolvedValueOnce(response);

      expect(
        service.getSession('beetlejuice', 'beetlejuice', 'beetlejuice'),
      ).resolves.toBeFalsy();
    });

    it('should get a session', async () => {
      const response = createMock<AxiosResponse>({
        data: { result: { id: 'fakeid' } },
      });

      jest
        .spyOn(service['httpService'], 'post')
        .mockResolvedValueOnce(response);

      expect(
        service.getSession('beetlejuice', 'beetlejuice', 'beetlejuice'),
      ).resolves.toBe('fakeid');
    });
  });

  describe('getBadges', () => {
    it('should get badges', async () => {
      const response = createMock<AxiosResponse>({
        data: {
          result: {
            paging: { total_pages: 1 },
            items: [
              {
                name: 'fake name',
                badge_number: 1,
                email: 'fake@email.com',
                custom_fields: {
                  PreferredPronouns: 'she/her',
                },
              },
            ],
          },
        },
      });

      jest.spyOn(service['httpService'], 'get').mockResolvedValueOnce(response);

      const badges = await service.getBadges('faketteid', 'fakeid');

      expect(badges.length).toBeGreaterThan(0);
    });

    it('should get more badges', async () => {
      const response = createMock<AxiosResponse>({
        data: {
          result: {
            paging: { total_pages: 2 },
            items: [
              {
                name: 'fake name',
                badge_number: 1,
                email: 'fake@email.com',
                custom_fields: {
                  PreferredPronouns: 'she/her',
                },
              },
            ],
          },
        },
      });

      jest
        .spyOn(service['httpService'], 'get')
        .mockResolvedValueOnce(response)
        .mockResolvedValueOnce(response);

      const badges = await service.getBadges('faketteid', 'fakeid');

      expect(badges.length).toBeGreaterThan(0);
    });
  });

  describe('getBadgesTypes', () => {
    it('should get badge types', async () => {
      const response = createMock<AxiosResponse>({
        data: {
          result: {
            paging: { total_pages: 1 },
            items: [
              {
                name: 'fake badge type',
              },
            ],
          },
        },
      });

      jest.spyOn(service['httpService'], 'get').mockResolvedValueOnce(response);

      const badgeTypes = await service.getBadgeTypes('faketteid', 'fakeid');

      expect(badgeTypes.length).toBeGreaterThan(0);
    });

    it('should get more badge types', async () => {
      const response = createMock<AxiosResponse>({
        data: {
          result: {
            paging: { total_pages: 2 },
            items: [
              {
                name: 'fake badge type',
              },
            ],
          },
        },
      });

      jest
        .spyOn(service['httpService'], 'get')
        .mockResolvedValueOnce(response)
        .mockResolvedValueOnce(response);

      const badgeTypes = await service.getBadgeTypes('faketteid', 'fakeid');

      expect(badgeTypes.length).toBeGreaterThan(0);
    });
  });
});
