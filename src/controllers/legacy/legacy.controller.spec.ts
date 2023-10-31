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
        },
      ];

      mockCtx.prisma.collection.findMany.mockResolvedValue(bigCollection);

      const bigResponse = await controller.getCopyCollections(1);

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
        },
      ];

      mockCtx.prisma.collection.findMany.mockResolvedValue(bigCollection);

      const bigResponse = await controller.getCopyCollections(1);

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

      const bigResponse = await controller.getCopyCollections(1);

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
        winnable: true,
        dateRetired: null,
        coverArtOverride: null,
        winnerId: null,
        collectionId: 1,
        organizationId: 1,
      };

      mockCtx.prisma.copy.create.mockResolvedValue(copy);

      const bigResponse = await controller.addCopy(1, 1, {
        libraryId: 1,
        title: 'Test Title',
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
        dateRetired: null,
        coverArtOverride: null,
        winnerId: null,
        collectionId: 1,
        organizationId: 1,
      };

      mockCtx.prisma.copy.update.mockResolvedValue(copy);

      const bigResponse = await controller.updateCopy('1', 1, {
        libraryId: '1',
        collectionId: 1,
        winnable: true,
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
        logo: <Buffer>{},
        logoSquare: <Buffer>{},
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
        logo: <Buffer>{},
        logoSquare: <Buffer>{},
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
        logo: <Buffer>{},
        logoSquare: <Buffer>{},
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
        logo: <Buffer>{},
        logoSquare: <Buffer>{},
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
        logo: <Buffer>{},
        logoSquare: <Buffer>{},
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
        logo: <Buffer>{},
        logoSquare: <Buffer>{},
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
        logo: <Buffer>{},
        logoSquare: <Buffer>{},
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
        logo: <Buffer>{},
        logoSquare: <Buffer>{},
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
        },
      ];

      mockCtx.prisma.attendee.findMany.mockResolvedValue(attendees);

      const bigResponse = await controller.getAttendees(1, '');

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
        },
      ];

      mockCtx.prisma.attendee.findMany.mockResolvedValue(attendees);

      const bigResponse = await controller.getAttendees(1, 'asdf');

      expect(bigResponse.Result.Attendees.length).toBe(1);
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
      };

      mockCtx.prisma.attendee.findUnique.mockResolvedValue(attendee);

      const convention = {
        id: 1,
        organizationId: 1,
        name: 'Geekway to the Testing',
        theme: 'Theme to the Testing',
        logo: <Buffer>{},
        logoSquare: <Buffer>{},
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
      };

      mockCtx.prisma.attendee.findUnique.mockResolvedValue(attendee);

      const convention = {
        id: 1,
        organizationId: 1,
        name: 'Geekway to the Testing',
        theme: 'Theme to the Testing',
        logo: <Buffer>{},
        logoSquare: <Buffer>{},
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
      };

      mockCtx.prisma.attendee.findUnique.mockResolvedValue(attendee);

      const convention = {
        id: 1,
        organizationId: 1,
        name: 'Geekway to the Testing',
        theme: 'Theme to the Testing',
        logo: <Buffer>{},
        logoSquare: <Buffer>{},
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
        winnerId: null,
        collectionId: null,
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
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should fail to check out a copy with a label', async () => {
      const convention = {
        id: 1,
        organizationId: 1,
        name: 'Geekway to the Testing',
        theme: 'Theme to the Testing',
        logo: <Buffer>{},
        logoSquare: <Buffer>{},
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
        winnerId: null,
        collectionId: null,
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
        logo: <Buffer>{},
        logoSquare: <Buffer>{},
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
        logo: <Buffer>{},
        logoSquare: <Buffer>{},
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
        logo: <Buffer>{},
        logoSquare: <Buffer>{},
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
        logo: <Buffer>{},
        logoSquare: <Buffer>{},
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
        logo: <Buffer>{},
        logoSquare: <Buffer>{},
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

      const expectedCopies = await controller.searchCopies('test', 1);

      expect(expectedCopies.Result.length).toBe(1);
    });

    it('should return some copies and not break', async () => {
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

      const expectedCopies = await controller.searchCopies('test', 1);

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

      const expectedCopies = await controller.searchCopies('test', 1);

      expect(expectedCopies.Result.length).toBe(1);
    });

    it('should return some copies and have a checkout', async () => {
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

      const expectedCopies = await controller.searchCopies('test', 1);

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
});
