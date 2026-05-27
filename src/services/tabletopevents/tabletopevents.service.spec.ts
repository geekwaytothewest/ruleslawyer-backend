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

  describe('getBadge', () => {
    it('returns the badge when number and convention match', async () => {
      const response = createMock<AxiosResponse>({
        data: {
          result: {
            badge_number: 5,
            convention_id: 'conv1',
            name: 'fake name',
          },
        },
      });

      jest.spyOn(service['httpService'], 'get').mockResolvedValueOnce(response);

      const badge: any = await service.getBadge('conv1', 5, 'badge1', 'session');

      expect(badge.name).toBe('fake name');
    });

    it('resolves null when the badge does not match', async () => {
      const response = createMock<AxiosResponse>({
        data: {
          result: {
            badge_number: 99,
            convention_id: 'otherConv',
          },
        },
      });

      jest.spyOn(service['httpService'], 'get').mockResolvedValueOnce(response);

      const badge = await service.getBadge('conv1', 5, 'badge1', 'session');

      expect(badge).toBeNull();
    });

    it('rejects when the request fails', async () => {
      jest
        .spyOn(service['httpService'], 'get')
        .mockRejectedValueOnce(new Error('network down'));

      await expect(
        service.getBadge('conv1', 5, 'badge1', 'session'),
      ).rejects.toThrow('network down');
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

  describe('getSoldProducts', () => {
    it('should get sold products', async () => {
      const response = createMock<AxiosResponse>({
        data: {
          result: {
            paging: { total_pages: 1 },
            items: [
              {
                productvariant: {
                  name: 'fake product',
                },
              },
            ],
          },
        },
      });

      jest.spyOn(service['httpService'], 'get').mockResolvedValueOnce(response);

      const badgeTypes = await service.getSoldProducts('faketteid', 'fakeid');

      expect(badgeTypes.length).toBeGreaterThan(0);
    });

    it('should get more sold products', async () => {
      const response = createMock<AxiosResponse>({
        data: {
          result: {
            paging: { total_pages: 2 },
            items: [
              {
                productvariant: {
                  name: 'fake product',
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

      const badgeTypes = await service.getSoldProducts('faketteid', 'fakeid');

      expect(badgeTypes.length).toBeGreaterThan(0);
    });

    it('rejects when the request fails', async () => {
      jest
        .spyOn(service['httpService'], 'get')
        .mockRejectedValueOnce(new Error('boom'));

      await expect(
        service.getSoldProducts('faketteid', 'fakeid'),
      ).rejects.toThrow('boom');
    });
  });

  describe('getBadges error handling', () => {
    it('rejects when the request fails', async () => {
      jest
        .spyOn(service['httpService'], 'get')
        .mockRejectedValueOnce(new Error('boom'));

      await expect(service.getBadges('faketteid', 'fakeid')).rejects.toThrow(
        'boom',
      );
    });

    it('logs a status update every tenth page', async () => {
      // 10 pages so the i % 10 === 0 status-log branch is exercised. sleep is
      // stubbed so the 9 inter-page waits don't run in real time.
      jest.spyOn(service, 'sleep').mockResolvedValue(undefined);
      const response = createMock<AxiosResponse>({
        data: {
          result: {
            paging: { total_pages: 10 },
            items: [{ badge_number: 1 }],
          },
        },
      });
      jest.spyOn(service['httpService'], 'get').mockResolvedValue(response);

      const badges = await service.getBadges('faketteid', 'fakeid');

      expect(badges).toHaveLength(10);
    });
  });

  describe('getConventionSoldProducts', () => {
    it('gets sold products for the convention', async () => {
      const response = createMock<AxiosResponse>({
        data: {
          result: {
            paging: { total_pages: 1 },
            items: [{ badge_id: 'b1', productvariant: { name: 'fake' } }],
          },
        },
      });

      jest.spyOn(service['httpService'], 'get').mockResolvedValueOnce(response);

      const products = await service.getConventionSoldProducts(
        'faketteid',
        'fakeid',
      );

      expect(products).toHaveLength(1);
    });

    it('pages through results and logs a status update every tenth page', async () => {
      jest.spyOn(service, 'sleep').mockResolvedValue(undefined);
      const response = createMock<AxiosResponse>({
        data: {
          result: {
            paging: { total_pages: 10 },
            items: [{ badge_id: 'b1' }],
          },
        },
      });
      jest.spyOn(service['httpService'], 'get').mockResolvedValue(response);

      const products = await service.getConventionSoldProducts(
        'faketteid',
        'fakeid',
      );

      expect(products).toHaveLength(10);
    });

    it('rejects when the request fails', async () => {
      jest
        .spyOn(service['httpService'], 'get')
        .mockRejectedValueOnce(new Error('boom'));

      await expect(
        service.getConventionSoldProducts('faketteid', 'fakeid'),
      ).rejects.toThrow('boom');
    });
  });
});
