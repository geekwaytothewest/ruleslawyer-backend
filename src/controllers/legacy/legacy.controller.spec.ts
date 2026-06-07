import { Test, TestingModule } from '@nestjs/testing';
import { LegacyController } from './legacy.controller';
import { LegacyModule } from '../../modules/legacy/legacy.module';
import {
  Context,
  MockContext,
  createMockContext,
} from '../../services/prisma/context';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('LegacyController', () => {
  let controller: LegacyController;
  let mockCtx: MockContext;
  let ctx: Context;

  beforeEach(async () => {
    mockCtx = createMockContext();
    ctx = mockCtx as unknown as Context;
    const module: TestingModule = await Test.createTestingModule({
      imports: [LegacyModule],
    }).compile();

    controller = module.get<LegacyController>(LegacyController);
    controller.ctx = ctx;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCopyCollections', () => {
    it('should return legacy collections', async () => {
      const bigCollection = [
        {
          id: 1,
          name: 'Test Collection',
          organizationId: 1,
          public: false,
          copies: [
            {
              id: 1,
              checkOuts: [
                {
                  id: 1,
                  checkOut: new Date('2023-01-01'),
                  checkIn: null,
                  attendee: {
                    id: 1,
                    name: 'Test Attendee',
                  },
                },
              ],
              game: {
                id: 1,
                name: 'Test Game',
              },
            },
          ],
          allowWinning: false,
          archived: false,
        },
      ];

      mockCtx.prisma.collection.findMany.mockResolvedValue(bigCollection);

      const bigResponse = await controller.getCopyCollections(1, 2);

      expect(bigResponse.Result.length).toBe(1);
    });

    it('should return legacy collections but weirder', async () => {
      const bigCollection = [
        {
          id: 1,
          name: 'Test Collection',
          organizationId: 1,
          public: false,
          copies: [
            {
              id: 1,
              checkOuts: [
                {
                  id: 1,
                  checkOut: new Date(),
                  checkIn: new Date(),
                  attendee: {
                    id: 1,
                    name: 'Test Attendee',
                  },
                },
              ],
              game: {
                id: 1,
                name: 'Test Game',
              },
            },
          ],
          allowWinning: false,
          archived: false,
        },
      ];

      mockCtx.prisma.collection.findMany.mockResolvedValue(bigCollection);

      const bigResponse = await controller.getCopyCollections(1, 1);

      expect(bigResponse.Result.length).toBe(1);
    });

    it('should return legacy collections but weird', async () => {
      const bigCollection = [
        {
          id: 1,
          name: 'Test Collection',
          organizationId: 1,
          public: false,
          allowWinning: false,
          archived: false,
          copies: [
            {
              id: 1,
              checkOuts: [
                {
                  id: 1,
                  checkOut: new Date(),
                  checkIn: new Date(),
                  attendee: {
                    id: 1,
                    name: 'Test Attendee',
                  },
                },
              ],
              game: {
                id: 1,
                name: 'Test Game',
              },
            },
          ],
        },
      ];

      mockCtx.prisma.collection.findMany.mockResolvedValue(bigCollection);

      const bigResponse = await controller.getCopyCollections(1, 1);

      expect(bigResponse.Result.length).toBe(1);
    });
  });

  describe('addCopy', () => {
    it('should add a copy', async () => {
      const copy = {
        id: 1,
        gameId: 1,
        barcode: '*00001*',
        barcodeLabel: '1',
        dateAdded: new Date(),
        comments: null,
        winnable: true,
        dateRetired: null,
        coverArtOverride: null,
        bggVersionOverride: null,
        winnerId: null,
        collectionId: 1,
        organizationId: 1,
      };

      mockCtx.prisma.copy.upsert.mockResolvedValue(copy);

      const bigResponse = await controller.addCopy(1, 1, {
        libraryId: 1,
        title: 'Test Title',
        winnable: false,
        comments: '',
      });

      expect(bigResponse?.winnable).toBeTruthy();
    });
  });

  describe('updateCopy', () => {
    it('should update a copy', async () => {
      const copy = {
        id: 1,
        gameId: 1,
        barcode: '*00001*',
        barcodeLabel: '1',
        dateAdded: new Date(),
        winnable: true,
        comments: null,
        dateRetired: null,
        coverArtOverride: null,
        bggVersionOverride: null,
        winnerId: null,
        collectionId: 1,
        organizationId: 1,
      };

      mockCtx.prisma.copy.update.mockResolvedValue(copy);

      const bigResponse = await controller.updateCopy('1', 1, {
        libraryId: '1',
        collectionId: 1,
        winnable: true,
        comments: '',
      });

      expect(bigResponse?.winnable).toBeTruthy();
    });
  });

  describe('getCopy', () => {
    it('should get a copy', async () => {
      const convention = {
        id: 1,
        organizationId: 1,
        name: 'Geekway to the Testing',
        theme: 'Theme to the Testing',
        logo: Buffer.alloc(0),
        logoSquare: Buffer.alloc(0),
        icon: '',
        startDate: new Date(),
        endDate: new Date(),
        registrationUrl: '',
        typeId: 1,
        annual: '',
        size: 3000,
        cancelled: false,
        playAndWinAnnounced: false,
        doorPrizesAnnounced: false,
        playAndWinCollectionId: null,
        doorPrizeCollectionId: null,
        playAndWinWinnersAnnounced: false,
        playAndWinWinnersSelected: false,
        tteConventionId: '',
      };

      mockCtx.prisma.convention.findUnique.mockResolvedValue(convention);

      const organization = {
        id: 1,
        name: 'Geekway to the Testing',
        ownerId: 1,
        enableBggSupport: false,
        collections: [
          {
            id: 1,
            name: 'Test Collection',
          },
        ],
      };

      mockCtx.prisma.organization.findUnique.mockResolvedValue(organization);

      const copy = {
        id: 1,
        gameId: 1,
        barcode: '*00001*',
        barcodeLabel: '1',
        dateAdded: new Date(),
        winnable: true,
        dateRetired: null,
        coverArtOverride: null,
        bggVersionOverride: null,
        winnerId: null,
        comments: null,
        collectionId: 1,
        game: {
          id: 1,
          name: 'Test Game',
        },
        collection: {
          id: 1,
          name: 'Test Collection',
        },
        checkOuts: [
          {
            id: 1,
            checkIn: null,
            checkOut: new Date(),
            attendee: {
              badgeNumber: '1',
              id: 1,
              name: 'Test Attendee',
            },
          },
        ],
        organizationId: 1,
      };

      mockCtx.prisma.copy.findUnique.mockResolvedValue(copy);

      const bigResponse = await controller.getCopy(1, 1, '*00001*');

      expect(bigResponse?.Result.Winnable).toBeTruthy();
    });

    it('should actually return', async () => {
      const convention = {
        id: 1,
        organizationId: 1,
        name: 'Geekway to the Testing',
        theme: 'Theme to the Testing',
        logo: Buffer.alloc(0),
        logoSquare: Buffer.alloc(0),
        icon: '',
        startDate: new Date(),
        endDate: new Date(),
        registrationUrl: '',
        typeId: 1,
        annual: '',
        size: 3000,
        cancelled: false,
        playAndWinAnnounced: false,
        doorPrizesAnnounced: false,
        playAndWinCollectionId: null,
        doorPrizeCollectionId: null,
        playAndWinWinnersAnnounced: false,
        playAndWinWinnersSelected: false,
        tteConventionId: '',
      };

      mockCtx.prisma.convention.findUnique.mockResolvedValue(convention);

      const organization = {
        id: 1,
        name: 'Geekway to the Testing',
        ownerId: 1,
        enableBggSupport: false,
        collections: [
          {
            id: 1,
            name: 'Test Collection',
          },
        ],
      };

      mockCtx.prisma.organization.findUnique.mockResolvedValue(organization);

      const copy = {
        id: 1,
        gameId: 1,
        barcode: '*00001*',
        barcodeLabel: '1',
        dateAdded: new Date(),
        winnable: true,
        dateRetired: null,
        coverArtOverride: null,
        bggVersionOverride: null,
        winnerId: null,
        collectionId: 1,
        comments: null,
        game: {
          id: 1,
          name: 'Test Game',
        },
        collection: {
          id: 1,
          name: 'Test Collection',
        },
        checkOuts: [],
        organizationId: 1,
      };

      mockCtx.prisma.copy.findUnique.mockResolvedValue(copy);

      const bigResponse = await controller.getCopy(1, 1, '*00001*');

      expect(bigResponse?.Result.Winnable).toBeTruthy();
    });

    it('should not break', async () => {
      const convention = {
        id: 1,
        organizationId: 1,
        name: 'Geekway to the Testing',
        theme: 'Theme to the Testing',
        logo: Buffer.alloc(0),
        logoSquare: Buffer.alloc(0),
        icon: '',
        startDate: new Date(),
        endDate: new Date(),
        registrationUrl: '',
        typeId: 1,
        annual: '',
        size: 3000,
        cancelled: false,
        playAndWinAnnounced: false,
        doorPrizesAnnounced: false,
        playAndWinCollectionId: null,
        doorPrizeCollectionId: null,
        playAndWinWinnersAnnounced: false,
        playAndWinWinnersSelected: false,
        tteConventionId: '',
      };

      mockCtx.prisma.convention.findUnique.mockResolvedValue(convention);

      const organization = {
        id: 1,
        name: 'Geekway to the Testing',
        ownerId: 1,
        enableBggSupport: false,
        collections: [
          {
            id: 1,
            name: 'Test Collection',
          },
        ],
      };

      mockCtx.prisma.organization.findUnique.mockResolvedValue(organization);

      const copy = {
        id: 1,
        gameId: 1,
        barcode: '*00001*',
        barcodeLabel: '1',
        dateAdded: new Date(),
        winnable: true,
        dateRetired: null,
        coverArtOverride: null,
        bggVersionOverride: null,
        winnerId: null,
        collectionId: 1,
        comments: null,
        game: {
          id: 1,
          name: 'Test Game',
        },
        collection: {
          id: 1,
          name: 'Test Collection',
        },
        checkOuts: [],
        organizationId: 1,
      };

      mockCtx.prisma.copy.findUnique.mockResolvedValue(copy);

      const bigResponse = await controller.getCopy(1, 1, '*00001*');

      expect(bigResponse?.Result.Winnable).toBeTruthy();
    });

    it('should definitely get a copy that does not have a checkout', async () => {
      const convention = {
        id: 1,
        organizationId: 1,
        name: 'Geekway to the Testing',
        theme: 'Theme to the Testing',
        logo: Buffer.alloc(0),
        logoSquare: Buffer.alloc(0),
        icon: '',
        startDate: new Date(),
        endDate: new Date(),
        registrationUrl: '',
        typeId: 1,
        annual: '',
        size: 3000,
        cancelled: false,
        playAndWinAnnounced: false,
        doorPrizesAnnounced: false,
        playAndWinCollectionId: null,
        doorPrizeCollectionId: null,
        playAndWinWinnersAnnounced: false,
        playAndWinWinnersSelected: false,
        tteConventionId: '',
      };

      mockCtx.prisma.convention.findUnique.mockResolvedValue(convention);

      const organization = {
        id: 1,
        name: 'Geekway to the Testing',
        ownerId: 1,
        enableBggSupport: false,
        collections: [
          {
            id: 1,
            name: 'Test Collection',
          },
        ],
      };

      mockCtx.prisma.organization.findUnique.mockResolvedValue(organization);

      const copy = {
        id: 1,
        gameId: 1,
        barcode: '*00001*',
        barcodeLabel: '1',
        dateAdded: new Date(),
        winnable: true,
        dateRetired: null,
        coverArtOverride: null,
        bggVersionOverride: null,
        winnerId: null,
        collectionId: 1,
        comments: null,
        game: {
          id: 1,
          name: 'Test Game',
        },
        collection: {
          id: 1,
          name: 'Test Collection',
        },
        checkOuts: [
          {
            id: 1,
            checkIn: null,
            checkOut: new Date(),
            attendee: {
              badgeNumber: '1',
              id: 1,
              name: 'Test Attendee',
            },
          },
        ],
        organizationId: 1,
      };

      mockCtx.prisma.copy.findUnique.mockResolvedValue(copy);

      const bigResponse = await controller.getCopy(1, 1, '*00001*');

      expect(bigResponse?.Result.Winnable).toBeTruthy();
    });

    it('should fail to get a copy', async () => {
      const convention = {
        id: 1,
        organizationId: 1,
        name: 'Geekway to the Testing',
        theme: 'Theme to the Testing',
        logo: Buffer.alloc(0),
        logoSquare: Buffer.alloc(0),
        icon: '',
        startDate: new Date(),
        endDate: new Date(),
        registrationUrl: '',
        typeId: 1,
        annual: '',
        size: 3000,
        cancelled: false,
        playAndWinAnnounced: false,
        doorPrizesAnnounced: false,
        playAndWinCollectionId: null,
        doorPrizeCollectionId: null,
        playAndWinWinnersAnnounced: false,
        playAndWinWinnersSelected: false,
        tteConventionId: '',
      };

      mockCtx.prisma.convention.findUnique.mockResolvedValue(convention);

      const organization = {
        id: 1,
        name: 'Geekway to the Testing',
        ownerId: 1,
        enableBggSupport: false,
        collections: [
          {
            id: 1,
            name: 'Test Collection',
          },
        ],
      };

      mockCtx.prisma.organization.findUnique.mockResolvedValue(organization);

      mockCtx.prisma.copy.findUnique.mockResolvedValue(null);

      expect(controller.getCopy(1, 1, '*00001*')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should get a copy from the label of a pnw collection', async () => {
      const convention = {
        id: 1,
        organizationId: 1,
        name: 'Geekway to the Testing',
        theme: 'Theme to the Testing',
        logo: Buffer.alloc(0),
        logoSquare: Buffer.alloc(0),
        icon: '',
        startDate: new Date(),
        endDate: new Date(),
        registrationUrl: '',
        typeId: 1,
        annual: '',
        size: 3000,
        cancelled: false,
        playAndWinAnnounced: false,
        doorPrizesAnnounced: false,
        playAndWinCollectionId: 1,
        doorPrizeCollectionId: 1,
        playAndWinWinnersAnnounced: false,
        playAndWinWinnersSelected: false,
        tteConventionId: '',
      };

      mockCtx.prisma.convention.findUnique.mockResolvedValue(convention);

      const organization = {
        id: 1,
        name: 'Geekway to the Testing',
        ownerId: 1,
        enableBggSupport: false,
        collections: [
          {
            id: 1,
            name: 'Test Collection',
          },
        ],
      };

      mockCtx.prisma.organization.findUnique.mockResolvedValue(organization);

      const copy = {
        id: 1,
        gameId: 1,
        barcode: '*00001*',
        barcodeLabel: '1',
        dateAdded: new Date(),
        winnable: true,
        dateRetired: null,
        coverArtOverride: null,
        bggVersionOverride: null,
        winnerId: null,
        collectionId: 1,
        comments: null,
        game: {
          id: 1,
          name: 'Test Game',
        },
        collection: {
          id: 1,
          name: 'Test Collection',
        },
        checkOuts: [
          {
            id: 1,
            checkIn: null,
            checkOut: new Date(),
            attendee: {
              badgeNumber: '1',
              id: 1,
              name: 'Test Attendee',
            },
          },
        ],
        organizationId: 1,
      };

      mockCtx.prisma.copy.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValue(copy);

      const bigResponse = await controller.getCopy(1, 1, '1');

      expect(bigResponse?.Result.Winnable).toBeTruthy();
    });

    it('should get a copy from the label of an org collection', async () => {
      const convention = {
        id: 1,
        organizationId: 1,
        name: 'Geekway to the Testing',
        theme: 'Theme to the Testing',
        logo: Buffer.alloc(0),
        logoSquare: Buffer.alloc(0),
        icon: '',
        startDate: new Date(),
        endDate: new Date(),
        registrationUrl: '',
        typeId: 1,
        annual: '',
        size: 3000,
        cancelled: false,
        playAndWinAnnounced: false,
        doorPrizesAnnounced: false,
        playAndWinCollectionId: null,
        doorPrizeCollectionId: 1,
        playAndWinWinnersAnnounced: false,
        playAndWinWinnersSelected: false,
        tteConventionId: '',
      };

      mockCtx.prisma.convention.findUnique.mockResolvedValue(convention);

      const organization = {
        id: 1,
        name: 'Geekway to the Testing',
        ownerId: 1,
        enableBggSupport: false,
        collections: [
          {
            id: 1,
            name: 'Test Collection',
          },
        ],
      };

      mockCtx.prisma.organization.findUnique.mockResolvedValue(organization);

      const copy = {
        id: 1,
        gameId: 1,
        barcode: '*00001*',
        barcodeLabel: '1',
        dateAdded: new Date(),
        winnable: true,
        dateRetired: null,
        coverArtOverride: null,
        bggVersionOverride: null,
        winnerId: null,
        collectionId: 1,
        comments: null,
        game: {
          id: 1,
          name: 'Test Game',
        },
        collection: {
          id: 1,
          name: 'Test Collection',
        },
        checkOuts: [
          {
            id: 1,
            checkIn: null,
            checkOut: new Date(),
            attendee: {
              badgeNumber: '1',
              id: 1,
              name: 'Test Attendee',
            },
          },
        ],
        organizationId: 1,
      };

      mockCtx.prisma.copy.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValue(copy);

      const bigResponse = await controller.getCopy(1, 1, '1');

      expect(bigResponse?.Result.Winnable).toBeTruthy();
    });

    it('should get a copy from the label', async () => {
      const convention = {
        id: 1,
        organizationId: 1,
        name: 'Geekway to the Testing',
        theme: 'Theme to the Testing',
        logo: Buffer.alloc(0),
        logoSquare: Buffer.alloc(0),
        icon: '',
        startDate: new Date(),
        endDate: new Date(),
        registrationUrl: '',
        typeId: 1,
        annual: '',
        size: 3000,
        cancelled: false,
        playAndWinAnnounced: false,
        doorPrizesAnnounced: false,
        playAndWinCollectionId: 1,
        doorPrizeCollectionId: 1,
        playAndWinWinnersAnnounced: false,
        playAndWinWinnersSelected: false,
        tteConventionId: '',
      };

      mockCtx.prisma.convention.findUnique.mockResolvedValue(convention);

      const organization = {
        id: 1,
        name: 'Geekway to the Testing',
        ownerId: 1,
        enableBggSupport: false,
        collections: [
          {
            id: 1,
            name: 'Test Collection',
          },
        ],
      };

      mockCtx.prisma.organization.findUnique.mockResolvedValue(organization);

      const copy = {
        id: 1,
        gameId: 1,
        barcode: '*00001*',
        barcodeLabel: '1',
        dateAdded: new Date(),
        winnable: true,
        dateRetired: null,
        coverArtOverride: null,
        bggVersionOverride: null,
        winnerId: null,
        collectionId: 1,
        comments: null,
        game: {
          id: 1,
          name: 'Test Game',
        },
        collection: {
          id: 1,
          name: 'Test Collection',
        },
        checkOuts: [
          {
            id: 1,
            checkIn: null,
            checkOut: new Date(),
            attendee: {
              badgeNumber: '1',
              id: 1,
              name: 'Test Attendee',
            },
          },
        ],
        organizationId: 1,
      };

      mockCtx.prisma.copy.findUnique.mockResolvedValue(copy);

      const bigResponse = await controller.getCopy(1, 1, '1');

      expect(bigResponse?.Result.Winnable).toBeTruthy();
    });
  });

  describe('getAttendees', () => {
    it('should get some attendees', async () => {
      const attendees = [
        {
          id: 1,
          badgeName: 'asdf',
          badgeFirstName: 'asdf',
          badgeLastName: 'asdf',
          legalName: 'asdf',
          conventionId: 1,
          badgeNumber: '1',
          barcode: '*00001*',
          userId: null,
          tteBadgeNumber: null,
          tteBadgeId: 'xxx',
          badgeTypeId: 1,
          email: 'test@geekway.com',
          pronounsId: 1,
          checkedIn: false,
          printed: false,
          registrationCode: 'fake code',
          merch: null,
          eligibleForPrizes: true,
          lostBadge: false,
        },
      ];

      mockCtx.prisma.attendee.findMany.mockResolvedValue(attendees);
      mockCtx.prisma.userConventionPermissions.findMany.mockResolvedValue([
        { attendee: true, geekGuide: true, admin: false },
      ] as any);

      const req = {
        user: {
          user: {
            id: 1,
          },
        },
      };

      const bigResponse = await controller.getAttendees(
        1,
        '',
        req,
      );

      expect(bigResponse.Result.Attendees.length).toBe(1);
    });

    it('should get some searched attendees', async () => {
      const attendees = [
        {
          id: 1,
          badgeName: 'asdf',
          badgeFirstName: 'asdf',
          badgeLastName: 'asdf',
          legalName: 'asdf',
          conventionId: 1,
          badgeNumber: '1',
          barcode: '*00001*',
          userId: null,
          tteBadgeNumber: null,
          tteBadgeId: 'xxx',
          badgeTypeId: 1,
          email: 'test@geekway.com',
          pronounsId: 1,
          checkedIn: false,
          printed: false,
          registrationCode: 'fake code',
          merch: null,
          eligibleForPrizes: true,
          lostBadge: false,
        },
      ];

      mockCtx.prisma.attendee.findMany.mockResolvedValue(attendees);

      const req = {
        user: {
          user: {
            id: 1,
          },
        },
      };

      const bigResponse = await controller.getAttendees(
        1,
        'asdf',
        req,
      );

      expect(bigResponse.Result.Attendees.length).toBe(1);
    });

    const makeAttendee = (id: number, badgeName: string, badgeNumber: string) =>
      ({
        id,
        badgeName,
        badgeFirstName: badgeName,
        badgeLastName: badgeName,
        legalName: badgeName,
        conventionId: 1,
        badgeNumber,
        barcode: `*${badgeNumber}*`,
        userId: null,
        tteBadgeNumber: null,
        tteBadgeId: 'xxx',
        badgeTypeId: 1,
        email: 'test@geekway.com',
        pronounsId: 1,
        checkedIn: false,
        printed: false,
        registrationCode: 'fake code',
        merch: null,
        eligibleForPrizes: true,
        lostBadge: false,
      }) as any;

    const req = { user: { user: { id: 1 } } };

    it('refuses overly broad searches as TooBroad', async () => {
      const attendees = Array.from({ length: 30 }, (_, i) =>
        makeAttendee(i + 1, `Andrew ${i}`, String(i + 1)),
      );
      mockCtx.prisma.attendee.findMany.mockResolvedValue(attendees);

      const response = await controller.getAttendees(1, 'and', req);

      expect(response.Result.Attendees.length).toBe(0);
      expect((response.Result as any).TooBroad).toBe(true);
    });

    it('ignores name searches shorter than the minimum length', async () => {
      const attendees = [
        makeAttendee(1, 'Andrew', '1'),
        makeAttendee(2, 'Andrea', '2'),
      ];
      mockCtx.prisma.attendee.findMany.mockResolvedValue(attendees);

      const response = await controller.getAttendees(1, 'an', req);

      expect(response.Result.Attendees.length).toBe(0);
    });

    it('matches on name-word prefix, not arbitrary substring', async () => {
      const attendees = [
        makeAttendee(1, 'Andrew Smith', '1'),
        makeAttendee(2, 'Alexander Jones', '2'), // contains "and" but not as a word prefix
      ];
      mockCtx.prisma.attendee.findMany.mockResolvedValue(attendees);

      const response = await controller.getAttendees(1, 'and', req);

      expect(response.Result.Attendees.length).toBe(1);
      expect(response.Result.Attendees[0].ID).toBe(1);
    });

    it('still allows exact badge-number lookup regardless of length', async () => {
      const attendees = [
        makeAttendee(1, 'Andrew', '7'),
        makeAttendee(2, 'Andrea', '8'),
      ];
      mockCtx.prisma.attendee.findMany.mockResolvedValue(attendees);

      const response = await controller.getAttendees(1, '7', req);

      expect(response.Result.Attendees.length).toBe(1);
      expect(response.Result.Attendees[0].BadgeNumber).toBe('7');
    });
  });

  describe('addAttendee', () => {
    it('should add an attendee', async () => {
      const attendee = {
        id: 1,
        badgeName: 'asdf',
        badgeFirstName: 'asdf',
        badgeLastName: 'asdf',
        legalName: 'asdf',
        conventionId: 1,
        badgeNumber: '1',
        barcode: '*00001*',
        userId: null,
        tteBadgeNumber: null,
        tteBadgeId: 'xxx',
        badgeTypeId: 1,
        email: 'test@geekway.com',
        pronounsId: 1,
        checkedIn: false,
        printed: false,
        registrationCode: 'fake code',
        merch: null,
        eligibleForPrizes: true,
        lostBadge: false,
      };

      mockCtx.prisma.attendee.create.mockResolvedValue(attendee);

      const bigResponse = await controller.addAttendee(1, {
        badgeNumber: '1',
        name: 'asdf',
        pronouns: 'She/Her',
      });

      expect(bigResponse.id).toBe(1);
    });
  });

  describe('updateAttendee', () => {
    it('should update an attendee', async () => {
      const attendee = {
        id: 1,
        badgeName: 'asdf',
        badgeFirstName: 'asdf',
        badgeLastName: 'asdf',
        legalName: 'asdf',
        conventionId: 1,
        badgeNumber: '1',
        barcode: '*00001*',
        userId: null,
        tteBadgeNumber: null,
        tteBadgeId: 'xxx',
        badgeTypeId: 1,
        email: 'test@geekway.com',
        pronounsId: 1,
        checkedIn: false,
        printed: false,
        registrationCode: 'fake code',
        merch: null,
        eligibleForPrizes: true,
        lostBadge: false,
      };

      mockCtx.prisma.attendee.update.mockResolvedValue(attendee);

      const bigResponse = await controller.updateAttendee('1', 1, {
        badgeNumber: '1',
        name: 'asdf',
        pronouns: 'She/Her',
      });

      expect(bigResponse.id).toBe(1);
    });
  });

  describe('getLongestCheckouts', () => {
    it('should get some checkouts', async () => {
      const checkOuts = [
        {
          id: 1,
          attendeeId: 1,
          checkOut: new Date(),
          checkIn: null,
          copyId: 1,
          attendee: {
            badgeNumber: '1',
            name: 'Test Name',
          },
          submitted: false,
        },
      ];

      mockCtx.prisma.checkOut.findMany.mockResolvedValue(checkOuts);

      const bigResponse = await controller.getLongestCheckouts(1, 1);

      expect(bigResponse.Result.length).toBe(1);
    });
  });

  describe('getRecentCheckouts', () => {
    it('should get some checkouts', async () => {
      const checkOuts = [
        {
          id: 1,
          attendeeId: 1,
          checkOut: new Date(),
          checkIn: null,
          copyId: 1,
          attendee: {
            badgeNumber: '1',
            name: 'Test Name',
          },
          submitted: false,
        },
      ];

      mockCtx.prisma.checkOut.findMany.mockResolvedValue(checkOuts);

      const bigResponse = await controller.getRecentCheckouts(1, 1);

      expect(bigResponse.Result.length).toBe(1);
    });
  });

  describe('checkoutCopy', () => {
    it('should check out a copy', async () => {
      const attendee = {
        id: 1,
        badgeName: 'asdf',
        badgeFirstName: 'asdf',
        badgeLastName: 'asdf',
        legalName: 'asdf',
        badgeNumber: '1',
        barcode: '*00001*',
        tteBadgeNumber: null,
        tteBadgeId: 'xxx',
        conventionId: 1,
        printed: false,
        checkedIn: false,
        registrationCode: 'fake code',
        userId: null,
        badgeTypeId: 1,
        email: 'test@geekway.com',
        pronounsId: 1,
        checkOuts: [
          {
            id: 1,
            checkIn: new Date(),
            checkOut: new Date(),
          },
        ],
        merch: null,
        eligibleForPrizes: true,
        lostBadge: false,
      };

      mockCtx.prisma.attendee.findUnique.mockResolvedValue(attendee);

      const convention = {
        id: 1,
        organizationId: 1,
        name: 'Geekway to the Testing',
        theme: 'Theme to the Testing',
        logo: Buffer.alloc(0),
        logoSquare: Buffer.alloc(0),
        icon: '',
        startDate: new Date(),
        endDate: new Date(),
        registrationUrl: '',
        typeId: 1,
        annual: '',
        size: 3000,
        cancelled: false,
        playAndWinAnnounced: false,
        doorPrizesAnnounced: false,
        playAndWinCollectionId: 1,
        doorPrizeCollectionId: 1,
        playAndWinWinnersAnnounced: false,
        playAndWinWinnersSelected: false,
        tteConventionId: '',
      };

      mockCtx.prisma.convention.findUnique.mockResolvedValue(convention);

      const organization = {
        id: 1,
        name: 'Geekway to the Testing',
        ownerId: 1,
        enableBggSupport: false,
        collections: [
          {
            id: 1,
            name: 'Test Collection',
          },
        ],
      };

      mockCtx.prisma.organization.findUnique.mockResolvedValue(organization);

      const copy = {
        id: 1,
        gameId: 1,
        barcode: '*00001*',
        barcodeLabel: '1',
        dateAdded: new Date(),
        winnable: true,
        dateRetired: null,
        coverArtOverride: null,
        bggVersionOverride: null,
        winnerId: null,
        collectionId: 1,
        comments: null,
        game: {
          id: 1,
          name: 'Test Game',
        },
        collection: {
          id: 1,
          name: 'Test Collection',
        },
        checkOuts: [
          {
            id: 1,
            checkIn: new Date(),
            checkOut: new Date(),
            attendee: {
              badgeNumber: '1',
              id: 1,
              name: 'Test Attendee',
            },
          },
        ],
        organizationId: 1,
      };

      mockCtx.prisma.copy.findUnique.mockResolvedValue(copy);

      mockCtx.prisma.checkOut.create.mockResolvedValue({
        id: 1,
        copyId: 1,
        attendeeId: 1,
        checkIn: new Date(),
        checkOut: new Date(),
        submitted: false,
      });

      const bigResponse = await controller.checkoutCopy(
        { attendeeBadgeNumber: '1', libraryId: '1', overrideLimit: false },
        1,
        1,
        { userId: 1 },
      );

      expect(bigResponse?.Result.Length.Days).toBe(0);
    });

    it('should check out a copy by label', async () => {
      const attendee = {
        id: 1,
        badgeName: 'asdf',
        badgeFirstName: 'asdf',
        badgeLastName: 'asdf',
        legalName: 'asdf',
        badgeNumber: '1',
        barcode: '*00001*',
        tteBadgeNumber: null,
        tteBadgeId: 'xxx',
        conventionId: 1,
        printed: false,
        checkedIn: false,
        registrationCode: 'fake code',
        userId: null,
        badgeTypeId: 1,
        email: 'test@geekway.com',
        pronounsId: 1,
        checkOuts: [
          {
            id: 1,
            checkIn: new Date(),
            checkOut: new Date(),
          },
        ],
        merch: null,
        eligibleForPrizes: true,
        lostBadge: false,
      };

      mockCtx.prisma.attendee.findUnique.mockResolvedValue(attendee);

      const convention = {
        id: 1,
        organizationId: 1,
        name: 'Geekway to the Testing',
        theme: 'Theme to the Testing',
        logo: Buffer.alloc(0),
        logoSquare: Buffer.alloc(0),
        icon: '',
        startDate: new Date(),
        endDate: new Date(),
        registrationUrl: '',
        typeId: 1,
        annual: '',
        size: 3000,
        cancelled: false,
        playAndWinAnnounced: false,
        doorPrizesAnnounced: false,
        playAndWinCollectionId: 1,
        doorPrizeCollectionId: 1,
        playAndWinWinnersAnnounced: false,
        playAndWinWinnersSelected: false,
        tteConventionId: '',
      };

      mockCtx.prisma.convention.findUnique.mockResolvedValue(convention);

      const organization = {
        id: 1,
        name: 'Geekway to the Testing',
        ownerId: 1,
        enableBggSupport: false,
        collections: [
          {
            id: 1,
            name: 'Test Collection',
          },
        ],
      };

      mockCtx.prisma.organization.findUnique.mockResolvedValue(organization);

      const copy = {
        id: 1,
        gameId: 1,
        barcode: '*00001*',
        barcodeLabel: '1',
        dateAdded: new Date(),
        winnable: true,
        dateRetired: null,
        coverArtOverride: null,
        bggVersionOverride: null,
        winnerId: null,
        collectionId: 1,
        comments: null,
        game: {
          id: 1,
          name: 'Test Game',
        },
        collection: {
          id: 1,
          name: 'Test Collection',
        },
        checkOuts: [
          {
            id: 1,
            checkIn: new Date(),
            checkOut: new Date(),
            attendee: {
              badgeNumber: '1',
              id: 1,
              name: 'Test Attendee',
            },
          },
        ],
        organizationId: 1,
      };

      mockCtx.prisma.copy.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(copy)
        .mockResolvedValueOnce(copy);

      mockCtx.prisma.checkOut.create.mockResolvedValue({
        id: 1,
        copyId: 1,
        attendeeId: 1,
        checkIn: new Date(),
        checkOut: new Date(),
        submitted: false,
      });

      const bigResponse = await controller.checkoutCopy(
        { attendeeBadgeNumber: '1', libraryId: '1', overrideLimit: false },
        1,
        1,
        { userId: 1 },
      );

      expect(bigResponse?.Result.Length.Days).toBe(0);
    });

    it('should fail to check out a copy an attendee already has another checkout', async () => {
      const attendee = {
        id: 1,
        badgeName: 'asdf',
        badgeFirstName: 'asdf',
        badgeLastName: 'asdf',
        legalName: 'asdf',
        badgeNumber: '1',
        barcode: '*00001*',
        tteBadgeNumber: null,
        tteBadgeId: 'xxx',
        conventionId: 1,
        printed: false,
        checkedIn: false,
        registrationCode: 'fake code',
        userId: null,
        badgeTypeId: 1,
        email: 'test@geekway.com',
        pronounsId: 1,
        checkOuts: [
          {
            id: 1,
            checkIn: null,
            checkOut: new Date(),
          },
        ],
        merch: null,
        eligibleForPrizes: true,
        lostBadge: false,
      };

      mockCtx.prisma.attendee.findUnique.mockResolvedValue(attendee);

      const convention = {
        id: 1,
        organizationId: 1,
        name: 'Geekway to the Testing',
        theme: 'Theme to the Testing',
        logo: Buffer.alloc(0),
        logoSquare: Buffer.alloc(0),
        icon: '',
        startDate: new Date(),
        endDate: new Date(),
        registrationUrl: '',
        typeId: 1,
        annual: '',
        size: 3000,
        cancelled: false,
        playAndWinAnnounced: false,
        doorPrizesAnnounced: false,
        playAndWinCollectionId: null,
        doorPrizeCollectionId: null,
        playAndWinWinnersAnnounced: false,
        playAndWinWinnersSelected: false,
        tteConventionId: '',
      };

      mockCtx.prisma.convention.findUnique.mockResolvedValue(convention);

      const organization = {
        id: 1,
        name: 'Geekway to the Testing',
        ownerId: 1,
        enableBggSupport: false,
        collections: [
          {
            id: 1,
            name: 'Test Collection',
          },
        ],
      };

      mockCtx.prisma.organization.findUnique.mockResolvedValue(organization);

      const copy = {
        id: 1,
        gameId: 1,
        barcode: '*00001*',
        barcodeLabel: '1',
        dateAdded: new Date(),
        winnable: true,
        dateRetired: null,
        coverArtOverride: null,
        bggVersionOverride: null,
        winnerId: null,
        collectionId: 1,
        comments: null,
        game: {
          id: 1,
          name: 'Test Game',
        },
        checkOuts: [
          {
            id: 1,
            checkIn: null,
            checkOut: new Date(),
            attendee: {
              badgeNumber: '1',
              id: 1,
              name: 'Test Attendee',
            },
          },
        ],
        organizationId: 1,
      };

      mockCtx.prisma.copy.findUnique.mockResolvedValueOnce(copy);

      mockCtx.prisma.checkOut.update.mockResolvedValue({
        id: 1,
        copyId: 1,
        attendeeId: 1,
        checkIn: new Date(),
        checkOut: new Date(),
        submitted: false,
      });

      expect(
        controller.checkoutCopy(
          { attendeeBadgeNumber: '1', libraryId: '1', overrideLimit: false },
          1,
          1,
          { userId: 1 },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should fail to check out a copy with a label', async () => {
      const convention = {
        id: 1,
        organizationId: 1,
        name: 'Geekway to the Testing',
        theme: 'Theme to the Testing',
        logo: Buffer.alloc(0),
        logoSquare: Buffer.alloc(0),
        icon: '',
        startDate: new Date(),
        endDate: new Date(),
        registrationUrl: '',
        typeId: 1,
        annual: '',
        size: 3000,
        cancelled: false,
        playAndWinAnnounced: false,
        doorPrizesAnnounced: false,
        playAndWinCollectionId: null,
        doorPrizeCollectionId: null,
        playAndWinWinnersAnnounced: false,
        playAndWinWinnersSelected: false,
        tteConventionId: '',
      };

      mockCtx.prisma.convention.findUnique.mockResolvedValue(convention);

      const organization = {
        id: 1,
        name: 'Geekway to the Testing',
        ownerId: 1,
        enableBggSupport: false,
        collections: [
          {
            id: 1,
            name: 'Test Collection',
          },
        ],
      };

      mockCtx.prisma.organization.findUnique.mockResolvedValue(organization);

      const copy = {
        id: 1,
        gameId: 1,
        barcode: '*00001*',
        barcodeLabel: '1',
        dateAdded: new Date(),
        winnable: true,
        dateRetired: null,
        coverArtOverride: null,
        bggVersionOverride: null,
        winnerId: null,
        collectionId: 1,
        comments: null,
        game: {
          id: 1,
          name: 'Test Game',
        },
        checkOuts: [
          {
            id: 1,
            checkIn: null,
            checkOut: new Date(),
            attendee: {
              badgeNumber: '1',
              id: 1,
              name: 'Test Attendee',
            },
          },
        ],
        organizationId: 1,
      };

      mockCtx.prisma.copy.findUnique.mockResolvedValueOnce(copy);

      mockCtx.prisma.checkOut.update.mockResolvedValue({
        id: 1,
        copyId: 1,
        attendeeId: 1,
        checkIn: new Date(),
        checkOut: new Date(),
        submitted: false,
      });

      expect(
        controller.checkoutCopy(
          { attendeeBadgeNumber: '1', libraryId: '1', overrideLimit: false },
          1,
          1,
          { userId: 1 },
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('checkinCopy', () => {
    it('should check in a copy', async () => {
      const convention = {
        id: 1,
        organizationId: 1,
        name: 'Geekway to the Testing',
        theme: 'Theme to the Testing',
        logo: Buffer.alloc(0),
        logoSquare: Buffer.alloc(0),
        icon: '',
        startDate: new Date(),
        endDate: new Date(),
        registrationUrl: '',
        typeId: 1,
        annual: '',
        size: 3000,
        cancelled: false,
        playAndWinAnnounced: false,
        doorPrizesAnnounced: false,
        playAndWinCollectionId: 1,
        doorPrizeCollectionId: 1,
        playAndWinWinnersAnnounced: false,
        playAndWinWinnersSelected: false,
        tteConventionId: '',
      };

      mockCtx.prisma.convention.findUnique.mockResolvedValue(convention);

      const organization = {
        id: 1,
        name: 'Geekway to the Testing',
        ownerId: 1,
        enableBggSupport: false,
        collections: [
          {
            id: 1,
            name: 'Test Collection',
          },
        ],
      };

      mockCtx.prisma.organization.findUnique.mockResolvedValue(organization);

      const copy = {
        id: 1,
        gameId: 1,
        barcode: '*00001*',
        barcodeLabel: '1',
        dateAdded: new Date(),
        winnable: true,
        dateRetired: null,
        coverArtOverride: null,
        bggVersionOverride: null,
        winnerId: null,
        collectionId: 1,
        comments: null,
        game: {
          id: 1,
          name: 'Test Game',
        },
        collection: {
          id: 1,
          name: 'Test Collection',
        },
        checkOuts: [
          {
            id: 1,
            checkIn: null,
            checkOut: new Date(),
            attendee: {
              badgeNumber: '1',
              id: 1,
              name: 'Test Attendee',
            },
          },
        ],
        organizationId: 1,
      };

      mockCtx.prisma.copy.findUnique.mockResolvedValue(copy);

      mockCtx.prisma.checkOut.update.mockResolvedValue({
        id: 1,
        copyId: 1,
        attendeeId: 1,
        checkIn: new Date(),
        checkOut: new Date(),
        submitted: false,
      });

      const bigResponse = await controller.checkinCopy(1, 1, '1');

      expect(bigResponse?.Result.Length.Days).toBe(0);
    });

    it('should not break', async () => {
      const convention = {
        id: 1,
        organizationId: 1,
        name: 'Geekway to the Testing',
        theme: 'Theme to the Testing',
        logo: Buffer.alloc(0),
        logoSquare: Buffer.alloc(0),
        icon: '',
        startDate: new Date(),
        endDate: new Date(),
        registrationUrl: '',
        typeId: 1,
        annual: '',
        size: 3000,
        cancelled: false,
        playAndWinAnnounced: false,
        doorPrizesAnnounced: false,
        playAndWinCollectionId: 1,
        doorPrizeCollectionId: 1,
        playAndWinWinnersAnnounced: false,
        playAndWinWinnersSelected: false,
        tteConventionId: '',
      };

      mockCtx.prisma.convention.findUnique.mockResolvedValue(convention);

      const organization = {
        id: 1,
        name: 'Geekway to the Testing',
        ownerId: 1,
        enableBggSupport: false,
        collections: [
          {
            id: 1,
            name: 'Test Collection',
          },
        ],
      };

      mockCtx.prisma.organization.findUnique.mockResolvedValue(organization);

      const copy = {
        id: 1,
        gameId: 1,
        barcode: '*00001*',
        barcodeLabel: '1',
        dateAdded: new Date(),
        winnable: true,
        dateRetired: null,
        coverArtOverride: null,
        bggVersionOverride: null,
        winnerId: null,
        collectionId: 1,
        comments: null,
        game: {
          id: 1,
          name: 'Test Game',
        },
        collection: {
          id: 1,
          name: 'Test Collection',
        },
        checkOuts: [
          {
            id: 1,
            checkIn: null,
            checkOut: new Date(),
            attendee: {
              badgeNumber: '1',
              id: 1,
              name: 'Test Attendee',
            },
          },
        ],
        organizationId: 1,
      };

      mockCtx.prisma.copy.findUnique.mockResolvedValue(copy);

      mockCtx.prisma.checkOut.update.mockResolvedValue({
        id: 1,
        copyId: 1,
        attendeeId: 1,
        checkIn: null,
        checkOut: new Date(),
        submitted: false,
      });

      const bigResponse = await controller.checkinCopy(1, 1, '1');

      expect(bigResponse?.Result.Length.Days).toBe(0);
    });

    it('should fail to check in a copy with a label', async () => {
      const convention = {
        id: 1,
        organizationId: 1,
        name: 'Geekway to the Testing',
        theme: 'Theme to the Testing',
        logo: Buffer.alloc(0),
        logoSquare: Buffer.alloc(0),
        icon: '',
        startDate: new Date(),
        endDate: new Date(),
        registrationUrl: '',
        typeId: 1,
        annual: '',
        size: 3000,
        cancelled: false,
        playAndWinAnnounced: false,
        doorPrizesAnnounced: false,
        playAndWinCollectionId: null,
        doorPrizeCollectionId: null,
        playAndWinWinnersAnnounced: false,
        playAndWinWinnersSelected: false,
        tteConventionId: '',
      };

      mockCtx.prisma.convention.findUnique.mockResolvedValue(convention);

      const organization = {
        id: 1,
        name: 'Geekway to the Testing',
        ownerId: 1,
        enableBggSupport: false,
        collections: [
          {
            id: 1,
            name: 'Test Collection',
          },
        ],
      };

      mockCtx.prisma.organization.findUnique.mockResolvedValue(organization);

      const copy = {
        id: 1,
        gameId: 1,
        barcode: '*00001*',
        barcodeLabel: '1',
        dateAdded: new Date(),
        winnable: true,
        dateRetired: null,
        coverArtOverride: null,
        bggVersionOverride: null,
        winnerId: null,
        collectionId: 1,
        comments: null,
        game: {
          id: 1,
          name: 'Test Game',
        },
        collection: {
          id: 1,
          name: 'Test Collection',
        },
        checkOuts: [
          {
            id: 1,
            checkIn: null,
            checkOut: new Date(),
            attendee: {
              badgeNumber: '1',
              id: 1,
              name: 'Test Attendee',
            },
          },
        ],
        organizationId: 1,
      };

      mockCtx.prisma.copy.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(copy);

      mockCtx.prisma.checkOut.update.mockResolvedValue({
        id: 1,
        copyId: 1,
        attendeeId: 1,
        checkIn: null,
        checkOut: new Date(),
        submitted: false,
      });

      expect(controller.checkinCopy(1, 1, '1')).rejects.toBe('copy not found');
    });

    it('should fail to check in a copy', async () => {
      const convention = {
        id: 1,
        organizationId: 1,
        name: 'Geekway to the Testing',
        theme: 'Theme to the Testing',
        logo: Buffer.alloc(0),
        logoSquare: Buffer.alloc(0),
        icon: '',
        startDate: new Date(),
        endDate: new Date(),
        registrationUrl: '',
        typeId: 1,
        annual: '',
        size: 3000,
        cancelled: false,
        playAndWinAnnounced: false,
        doorPrizesAnnounced: false,
        playAndWinCollectionId: null,
        doorPrizeCollectionId: null,
        playAndWinWinnersAnnounced: false,
        playAndWinWinnersSelected: false,
        tteConventionId: '',
      };

      mockCtx.prisma.convention.findUnique.mockResolvedValue(convention);

      const organization = {
        id: 1,
        name: 'Geekway to the Testing',
        ownerId: 1,
        enableBggSupport: false,
        collections: [
          {
            id: 1,
            name: 'Test Collection',
          },
        ],
      };

      mockCtx.prisma.organization.findUnique.mockResolvedValue(organization);

      const copy = {
        id: 1,
        gameId: 1,
        barcode: '*00001*',
        barcodeLabel: '1',
        dateAdded: new Date(),
        winnable: true,
        dateRetired: null,
        coverArtOverride: null,
        bggVersionOverride: null,
        winnerId: null,
        collectionId: 1,
        comments: null,
        game: {
          id: 1,
          name: 'Test Game',
        },
        collection: {
          id: 1,
          name: 'Test Collection',
        },
        checkOuts: [
          {
            id: 1,
            checkIn: null,
            checkOut: new Date(),
            attendee: {
              badgeNumber: '1',
              id: 1,
              name: 'Test Attendee',
            },
          },
        ],
        organizationId: 1,
      };

      mockCtx.prisma.copy.findUnique.mockResolvedValueOnce(copy);

      mockCtx.prisma.checkOut.update.mockResolvedValue({
        id: 1,
        copyId: 1,
        attendeeId: 1,
        checkIn: new Date(),
        checkOut: new Date(),
        submitted: false,
      });

      expect(controller.checkinCopy(1, 1, '*00001*')).rejects.toBe(
        'copy not found',
      );
    });

    it('should fail to check in a copy with a bad id', async () => {
      const convention = {
        id: 1,
        organizationId: 1,
        name: 'Geekway to the Testing',
        theme: 'Theme to the Testing',
        logo: Buffer.alloc(0),
        logoSquare: Buffer.alloc(0),
        icon: '',
        startDate: new Date(),
        endDate: new Date(),
        registrationUrl: '',
        typeId: 1,
        annual: '',
        size: 3000,
        cancelled: false,
        playAndWinAnnounced: false,
        doorPrizesAnnounced: false,
        playAndWinCollectionId: 1,
        doorPrizeCollectionId: 1,
        playAndWinWinnersAnnounced: false,
        playAndWinWinnersSelected: false,
        tteConventionId: '',
      };

      mockCtx.prisma.convention.findUnique.mockResolvedValue(convention);

      const organization = {
        id: 1,
        name: 'Geekway to the Testing',
        ownerId: 1,
        enableBggSupport: false,
        collections: [
          {
            id: 1,
            name: 'Test Collection',
          },
        ],
      };

      mockCtx.prisma.organization.findUnique.mockResolvedValue(organization);

      mockCtx.prisma.copy.findUnique.mockResolvedValue(null);

      expect(controller.checkinCopy(1, 1, '123123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('searchCopies', () => {
    it('should return some copies', async () => {
      const copies = [
        {
          id: 1,
          gameId: 1,
          barcode: '*00001*',
          barcodeLabel: '1',
          dateAdded: new Date(),
          winnable: true,
          dateRetired: null,
          coverArtOverride: null,
          bggVersionOverride: null,
          winnerId: null,
          collectionId: 1,
          comments: null,
          game: {
            id: 1,
            name: 'Test Game',
          },
          collection: {
            id: 1,
            name: 'Test Collection',
          },
          checkOuts: [
            {
              id: 1,
              checkIn: new Date(),
              checkOut: new Date(),
              attendee: {
                badgeNumber: '1',
                id: 1,
                name: 'Test Attendee',
              },
            },
          ],
          organizationId: 1,
        },
      ];

      mockCtx.prisma.copy.findMany.mockResolvedValue(copies);

      const expectedCopies = await controller.searchCopies('test', 1, 1);

      expect(expectedCopies.Result.length).toBe(1);
    });

    it('should return some copies and not break', async () => {
      const copies = [
        {
          id: 1,
          gameId: 1,
          barcode: '*00001*',
          barcodeLabel: '1',
          comments: null,
          dateAdded: new Date(),
          winnable: true,
          dateRetired: null,
          coverArtOverride: null,
          bggVersionOverride: null,
          winnerId: null,
          collectionId: 1,
          game: {
            id: 1,
            name: 'Test Game',
          },
          collection: {
            id: 1,
            name: 'Test Collection',
          },
          checkOuts: [],
          organizationId: 1,
        },
      ];

      mockCtx.prisma.copy.findMany.mockResolvedValue(copies);

      const expectedCopies = await controller.searchCopies('test', 1, 1);

      expect(expectedCopies.Result.length).toBe(1);
    });

    it('should return some copies and have a weird checkout', async () => {
      const copies = [
        {
          id: 1,
          gameId: 1,
          barcode: '*00001*',
          barcodeLabel: '1',
          dateAdded: new Date(),
          winnable: true,
          dateRetired: null,
          coverArtOverride: null,
          bggVersionOverride: null,
          winnerId: null,
          collectionId: 1,
          comments: null,
          game: {
            id: 1,
            name: 'Test Game',
          },
          collection: {
            id: 1,
            name: 'Test Collection',
          },
          checkOuts: [
            {
              id: 1,
              checkIn: null,
              checkOut: new Date(),
              attendee: {
                badgeNumber: '1',
                id: 1,
                name: 'Test Attendee',
              },
            },
          ],
          organizationId: 1,
        },
      ];

      mockCtx.prisma.copy.findMany.mockResolvedValue(copies);

      const expectedCopies = await controller.searchCopies('test', 1, 1);

      expect(expectedCopies.Result.length).toBe(1);
    });

    it('should return some copies and have a checkout', async () => {
      const copies = [
        {
          id: 1,
          gameId: 1,
          barcode: '*00001*',
          barcodeLabel: '1',
          comments: null,
          dateAdded: new Date(),
          winnable: true,
          dateRetired: null,
          coverArtOverride: null,
          bggVersionOverride: null,
          winnerId: null,
          collectionId: 1,
          game: {
            id: 1,
            name: 'Test Game',
          },
          collection: {
            id: 1,
            name: 'Test Collection',
          },
          checkOuts: [
            {
              id: 1,
              checkIn: null,
              checkOut: new Date(),
              attendee: {
                badgeNumber: '1',
                id: 1,
                name: 'Test Attendee',
              },
            },
          ],
          organizationId: 1,
        },
      ];

      mockCtx.prisma.copy.findMany.mockResolvedValue(copies);

      const expectedCopies = await controller.searchCopies('test', 1, 1);

      expect(expectedCopies.Result.length).toBe(1);
    });
  });

  describe('getPrizeEntries', () => {
    it('should get some entries', async () => {
      const many = [
        {
          id: 1,
          attendeeId: 1,
          attendee: {
            id: 1,
            badgeName: 'asdf',
            badgeNumber: '1',
          },
          Copy: {
            game: {
              id: 1,
              name: 'test name',
            },
            collection: {
              id: 1,
              name: 'Geekway Test',
              allowWinning: true,
            },
            id: 1,
            name: 'Test Game',
            winnable: true,
          },
          checkOut: new Date(),
          checkIn: null,
          copyId: 1,
          submitted: false,
        },
      ];

      mockCtx.prisma.checkOut.findMany.mockResolvedValue(many);

      expect(controller.getPrizeEntries('1')).resolves.toBeTruthy();
    });
  });

  describe('submitPrizeEntries', () => {
    it('should submit', async () => {
      const checkOut = {
        id: 1,
        checkIn: new Date(),
        checkOut: new Date(),
        attendeeId: 1,
        submitted: false,
        copyId: 1,
      };

      mockCtx.prisma.checkOut.findUnique.mockResolvedValue(checkOut);
      mockCtx.prisma.player.createMany.mockResolvedValue({
        count: 1,
      });
      mockCtx.prisma.checkOut.update.mockResolvedValue(checkOut);

      expect(
        controller.submitPrizeEntry({
          checkoutId: 1,
          players: [
            {
              id: 1,
              name: 'Test Player',
              rating: 5,
              wantsToWin: true,
            },
          ],
        }),
      ).toBeTruthy();
    });
  });

  const playRow = {
    id: 1,
    checkOut: new Date(),
    checkIn: null,
    copy: {
      gameId: 1,
      game: { id: 1, name: 'Catan' },
      collection: { id: 1, name: 'Library', allowWinning: true },
    },
    players: [
      {
        attendee: { badgeNumber: '101', badgeName: 'Ada' },
        wantToWin: true,
        rating: 5,
      },
    ],
  };

  const copyRow = {
    gameId: 1,
    barcodeLabel: '1',
    winnable: false,
    checkOuts: [{ checkOut: new Date() }],
    game: { id: 1, name: 'Catan' },
    collection: { id: 1, name: 'Library', allowWinning: true },
  };

  describe('getPlays', () => {
    it('should map checkouts into legacy play objects', async () => {
      mockCtx.prisma.checkOut.findMany.mockResolvedValue([playRow] as any);

      const result = await controller.getPlays(1);

      expect(result.Result.Plays).toHaveLength(1);
      expect(result.Result.Plays[0].GameName).toBe('Catan');
      expect(result.Result.Plays[0].Players?.[0].Name).toBe('Ada');
    });
  });

  describe('getCollPlays', () => {
    it('should map collection checkouts into legacy play objects', async () => {
      mockCtx.prisma.checkOut.findMany.mockResolvedValue([playRow] as any);

      const result = await controller.getCollPlays(1, 2);

      expect(result.Result.Plays).toHaveLength(1);
      expect(result.Result.Plays[0].Collection.Name).toBe('Library');
    });
  });

  describe('addCollection', () => {
    it('should create a collection', async () => {
      mockCtx.prisma.collection.create.mockResolvedValue({
        id: 1,
        name: 'New',
        organizationId: 1,
        public: false,
        allowWinning: true,
        archived: false,
      });

      const result = (await controller.addCollection(1, 1, {
        name: 'New',
        allowWinning: true,
      })) as any;

      expect(result?.id).toBe(1);
    });
  });

  describe('updateCollection', () => {
    it('should update a collection', async () => {
      mockCtx.prisma.collection.update.mockResolvedValue({
        id: 1,
        name: 'Updated',
        organizationId: 1,
        public: false,
        allowWinning: false,
        archived: false,
      });

      const result = (await controller.updateCollection(1, 1, {
        name: 'Updated',
        allowWinning: false,
      })) as any;

      expect(result?.name).toBe('Updated');
    });
  });

  describe('getGames', () => {
    it('should return games with their copies', async () => {
      mockCtx.prisma.game.findMany.mockResolvedValue([
        { id: 1, name: 'Catan' },
      ] as any);
      mockCtx.prisma.copy.findMany.mockResolvedValue([copyRow] as any);

      const result = await controller.getGames(1);

      expect(result.Result.Games).toHaveLength(1);
      expect(result.Result.Games[0].Copies).toHaveLength(1);
    });
  });

  describe('getGamesByCollectionId', () => {
    it('should return games with copies filtered by collection', async () => {
      mockCtx.prisma.game.findMany.mockResolvedValue([
        { id: 1, name: 'Catan' },
      ] as any);
      mockCtx.prisma.copy.findMany.mockResolvedValue([copyRow] as any);

      const result = await controller.getGamesByCollectionId(1, 2);

      expect(result.Result.Games[0].Copies[0].Title).toBe('Catan');
    });
  });

  describe('getGameList', () => {
    it('should return the raw game list', async () => {
      mockCtx.prisma.game.findMany.mockResolvedValue([{ id: 1 }] as any);

      const games = await controller.getGameList(1);

      expect(games.length).toBe(1);
    });
  });

  describe('addGame', () => {
    it('should create a game from a title', async () => {
      mockCtx.prisma.game.create.mockResolvedValue({ id: 1 } as any);

      const game = await controller.addGame(1, { title: 'Catan' });

      expect(game?.id).toBe(1);
      const args = mockCtx.prisma.game.create.mock.calls[0][0] as any;
      expect(args.data.name).toBe('Catan');
    });
  });

  describe('updateGame', () => {
    it('should update a game title', async () => {
      mockCtx.prisma.game.update.mockResolvedValue({ id: 1 } as any);

      const game = await controller.updateGame(1, 1, { title: 'New Title' });

      expect(game?.id).toBe(1);
      const args = mockCtx.prisma.game.update.mock.calls[0][0] as any;
      expect(args.data.name).toBe('New Title');
    });
  });

  describe('getAttendeeByBadgeNumber', () => {
    it('should look up an attendee by convention and badge number', async () => {
      mockCtx.prisma.attendee.findUnique.mockResolvedValue({ id: 1 } as any);

      const attendee = await controller.getAttendeeByBadgeNumber(1, '101');

      expect(attendee?.id).toBe(1);
      const args = mockCtx.prisma.attendee.findUnique.mock.calls[0][0] as any;
      expect(args.where.conventionId_badgeNumber.badgeNumber).toBe('101');
    });
  });

  describe('badgeTransfer', () => {
    it('should delegate to the attendee service', async () => {
      mockCtx.prisma.attendee.update.mockResolvedValue({ id: 1 } as any);

      const result = await controller.badgeTransfer(1, {
        fromBadgeNumber: '101',
        newBadgeFirstName: 'Ada',
        newBadgeLastName: 'Lovelace',
        newBadgeName: 'Ada Lovelace',
        newBadgeLegalName: 'Ada Lovelace',
        newBadgeEmail: 'ada@geekway.com',
        newBadgePronouns: 'she/her',
        newBadgePronounsId: null,
      });

      expect(result.id).toBe(1);
    });
  });

  describe('badgeReplacement', () => {
    it('should delegate to the attendee service', async () => {
      const spy = jest
        .spyOn(controller['attendeeService'], 'replaceBadge')
        .mockResolvedValue(undefined as any);

      await controller.badgeReplacement(1, {
        fromBadgeNumber: '101',
        toBadgeNumber: '102',
      });

      expect(spy).toHaveBeenCalledWith(
        1,
        { fromBadgeNumber: '101', toBadgeNumber: '102' },
        ctx,
      );
    });
  });

  describe('exportPlaysByCollectionId', () => {
    it('should build a csv export for the collection', async () => {
      mockCtx.prisma.checkOut.findMany.mockResolvedValue([
        {
          id: 1,
          checkOut: new Date(),
          checkIn: null,
          copy: {
            game: { name: 'Catan' },
            barcodeLabel: '1',
            collection: { name: 'Library' },
          },
          attendee: { badgeName: 'Ada' },
        },
      ] as any);

      const result = await controller.exportPlaysByCollectionId(1, 2);

      expect(result.collectionName).toBe('Library');
      expect(result.csvText).toBeDefined();
    });
  });

  describe('importCollection', () => {
    it('should reject when the file is missing', async () => {
      const req = { file: () => null } as any;

      await expect(controller.importCollection(req, 1)).rejects.toBe(
        'missing file',
      );
    });

    it('should delegate to the collection service when a file is present', async () => {
      const req = {
        file: () => ({
          toBuffer: () => Buffer.from('data'),
          fields: { name: 'Coll' },
        }),
      } as any;
      const spy = jest
        .spyOn(controller['collectionService'], 'importCollection')
        .mockResolvedValue({ importCount: 1 } as any);

      await controller.importCollection(req, 1);

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('uploadCopies', () => {
    it('should reject when the file is missing', async () => {
      const req = { file: () => null } as any;

      await expect(controller.uploadCopies(req, 1, 2)).rejects.toBe(
        'missing file',
      );
    });

    it('should delegate to the collection service when a file is present', async () => {
      const req = {
        file: () => ({ toBuffer: () => Buffer.from('data') }),
      } as any;
      const spy = jest
        .spyOn(controller['collectionService'], 'uploadCopies')
        .mockResolvedValue({} as any);

      await controller.uploadCopies(req, 1, 2);

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('importAttendees', () => {
    it('should reject when the file is missing', async () => {
      const req = { file: () => null } as any;

      await expect(controller.importAttendees(req, 1)).rejects.toBe(
        'missing file',
      );
    });

    it('launches the csv import in the background and returns "started"', async () => {
      const req = {
        file: () => ({ toBuffer: () => Buffer.from('Ada,Lovelace,101\n') }),
      } as any;
      const startSpy = jest
        .spyOn(controller['conventionService'], 'startImportAttendeesCSV')
        .mockReturnValue({ status: 'started', message: 'go' });

      const result = await controller.importAttendees(req, 1);

      expect(result.status).toBe('started');
      expect(startSpy).toHaveBeenCalledWith(
        Buffer.from('Ada,Lovelace,101\n'),
        1,
        controller['ctx'],
      );
    });
  });

  describe('syncTabletopEvents', () => {
    it('launches the import in the background and returns "started"', async () => {
      const spy = jest
        .spyOn(controller['conventionService'], 'startSyncTabletopEventsAttendees')
        .mockReturnValue({ status: 'started', message: 'go' });

      const userData = {
        userName: 'u',
        password: 'p',
        apiKey: 'k',
        tteBadgeNumber: 1,
        tteBadgeId: 'x',
      };
      const result = await controller.syncTabletopEvents(1, userData);

      expect(result.status).toBe('started');
      expect(spy).toHaveBeenCalledWith(userData, 1, controller['ctx']);
    });
  });

  describe('getAttendees permissions', () => {
    it('should return no attendees for a user with only attendee permission', async () => {
      mockCtx.prisma.attendee.findMany.mockResolvedValue([
        {
          id: 1,
          badgeName: 'asdf',
          badgeNumber: '1',
          tteBadgeNumber: null,
          tteBadgeId: 'xxx',
          pronounsId: 1,
        },
      ] as any);

      mockCtx.prisma.userConventionPermissions.findMany.mockResolvedValue([
        {
          attendee: true,
          geekGuide: false,
          admin: false,
        },
      ] as any);

      const req = { user: { user: { id: 1 } } };

      const response = await controller.getAttendees(1, '', req);

      expect(response.Result.Attendees.length).toBe(0);
    });
  });

  describe('checkoutCopy edge cases', () => {
    it('should throw NotFoundException when the copy is not found', async () => {
      mockCtx.prisma.attendee.findUnique.mockResolvedValue({
        id: 1,
        barcode: '*00001*',
        badgeNumber: '1',
        badgeName: 'Ada',
        checkOuts: [],
      } as any);
      mockCtx.prisma.copy.findUnique.mockResolvedValue(null);

      await expect(
        controller.checkoutCopy(
          { attendeeBadgeNumber: '1', libraryId: '1', overrideLimit: false },
          1,
          1,
          { id: 1 },
        ),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should throw when the attendee already has a game checked out', async () => {
      mockCtx.prisma.attendee.findUnique.mockResolvedValue({
        id: 1,
        barcode: '*00001*',
        badgeNumber: '1',
        badgeName: 'Ada',
        checkOuts: [{ id: 1, checkIn: null, copyId: 5 }],
      } as any);
      mockCtx.prisma.copy.findUnique.mockResolvedValue({
        id: 5,
        gameId: 9,
        barcodeLabel: '5',
      } as any);
      mockCtx.prisma.game.findUnique.mockResolvedValue({
        id: 9,
        name: 'Catan',
      } as any);

      await expect(
        controller.checkoutCopy(
          { attendeeBadgeNumber: '1', libraryId: '1', overrideLimit: false },
          1,
          1,
          { id: 1 },
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('checkinCopy attendee found', () => {
    it('should include the attendee details when one is found', async () => {
      mockCtx.prisma.copy.findUnique.mockResolvedValue({
        id: 1,
        collectionId: 1,
        barcode: '*00001*',
        barcodeLabel: '1',
        winnable: true,
        game: { id: 1, name: 'Catan' },
        collection: { id: 1, name: 'Library' },
        checkOuts: [{ id: 1, checkIn: null, checkOut: new Date() }],
      } as any);
      mockCtx.prisma.checkOut.update.mockResolvedValue({
        id: 1,
        attendeeId: 1,
        checkIn: new Date(),
        checkOut: new Date(),
      } as any);
      mockCtx.prisma.attendee.findUnique.mockResolvedValue({
        id: 1,
        badgeNumber: '1',
        badgeName: 'Ada',
      } as any);

      const response = await controller.checkinCopy(1, 1, '1');

      expect(response?.Result.Attendee.Name).toBe('Ada');
    });
  });
});
