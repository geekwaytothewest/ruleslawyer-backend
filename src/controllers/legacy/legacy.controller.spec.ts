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
      };

      mockCtx.prisma.copy.create.mockResolvedValue(copy);

      const bigResponse = await controller.addCopy(1, {
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
      };

      mockCtx.prisma.copy.update.mockResolvedValue(copy);

      const bigResponse = await controller.updateCopy(1, {
        libraryId: 1,
        title: 'Test Copy',
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
        startDate: null,
        endDate: null,
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
        startDate: null,
        endDate: null,
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
            checkIn: new Date(),
            checkOut: new Date(),
            attendee: {
              badgeNumber: '1',
              id: 1,
              name: 'Test Attendee',
            },
          },
        ],
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
        startDate: null,
        endDate: null,
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
        startDate: null,
        endDate: null,
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
        startDate: null,
        endDate: null,
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
        startDate: null,
        endDate: null,
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
          name: 'Test Attendee',
          conventionId: 1,
          badgeNumber: '1',
          barcode: '*00001*',
          userId: null,
          tteBadgeNumber: null,
          badgeTypeId: 1,
          email: 'test@geekway.com',
          pronounsId: 1,
          checkedIn: false,
          printed: false,
          registrationCode: 'fake code',
        },
      ];

      mockCtx.prisma.attendee.findMany.mockResolvedValue(attendees);

      const bigResponse = await controller.getAttendees(1);

      expect(bigResponse.Result.Attendees.length).toBe(1);
    });
  });

  describe('addAttendee', () => {
    it('should add an attendee', async () => {
      const attendee = {
        id: 1,
        name: 'Test Attendee',
        conventionId: 1,
        badgeNumber: '1',
        barcode: '*00001*',
        userId: null,
        tteBadgeNumber: null,
        badgeTypeId: 1,
        email: 'test@geekway.com',
        pronounsId: 1,
        checkedIn: false,
        printed: false,
        registrationCode: 'fake code',
      };

      mockCtx.prisma.attendee.create.mockResolvedValue(attendee);

      const bigResponse = await controller.addAttendee(1, attendee);

      expect(bigResponse.id).toBe(1);
    });
  });

  describe('updateAttendee', () => {
    it('should update an attendee', async () => {
      const attendee = {
        id: 1,
        name: 'Test Attendee',
        conventionId: 1,
        badgeNumber: '1',
        barcode: '*00001*',
        userId: null,
        tteBadgeNumber: null,
        badgeTypeId: 1,
        email: 'test@geekway.com',
        pronounsId: 1,
        checkedIn: false,
        printed: false,
        registrationCode: 'fake code',
      };

      mockCtx.prisma.attendee.update.mockResolvedValue(attendee);

      const bigResponse = await controller.updateAttendee('1', 1, attendee);

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
        name: 'Test Attendee',
        badgeNumber: '1',
        barcode: '*00001*',
        tteBadgeNumber: null,
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
        startDate: null,
        endDate: null,
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
      };

      mockCtx.prisma.copy.findUnique.mockResolvedValue(copy);

      mockCtx.prisma.checkOut.create.mockResolvedValue({
        id: 1,
        copyId: 1,
        attendeeId: 1,
        checkIn: new Date(),
        checkOut: new Date(),
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
        name: 'Test Attendee',
        badgeNumber: '1',
        barcode: '*00001*',
        tteBadgeNumber: null,
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
        startDate: null,
        endDate: null,
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
      };

      mockCtx.prisma.copy.findUnique.mockResolvedValueOnce(copy);

      mockCtx.prisma.checkOut.update.mockResolvedValue({
        id: 1,
        copyId: 1,
        attendeeId: 1,
        checkIn: new Date(),
        checkOut: new Date(),
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
        startDate: null,
        endDate: null,
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
      };

      mockCtx.prisma.copy.findUnique.mockResolvedValueOnce(copy);

      mockCtx.prisma.checkOut.update.mockResolvedValue({
        id: 1,
        copyId: 1,
        attendeeId: 1,
        checkIn: new Date(),
        checkOut: new Date(),
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
        startDate: null,
        endDate: null,
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
      };

      mockCtx.prisma.copy.findUnique.mockResolvedValue(copy);

      mockCtx.prisma.checkOut.update.mockResolvedValue({
        id: 1,
        copyId: 1,
        attendeeId: 1,
        checkIn: new Date(),
        checkOut: new Date(),
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
        startDate: null,
        endDate: null,
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
      };

      mockCtx.prisma.copy.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(copy);

      mockCtx.prisma.checkOut.update.mockResolvedValue({
        id: 1,
        copyId: 1,
        attendeeId: 1,
        checkIn: new Date(),
        checkOut: new Date(),
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
        startDate: null,
        endDate: null,
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
      };

      mockCtx.prisma.copy.findUnique.mockResolvedValueOnce(copy);

      mockCtx.prisma.checkOut.update.mockResolvedValue({
        id: 1,
        copyId: 1,
        attendeeId: 1,
        checkIn: new Date(),
        checkOut: new Date(),
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
        startDate: null,
        endDate: null,
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
              checkIn: null,
              checkOut: new Date(),
              attendee: {
                badgeNumber: '1',
                id: 1,
                name: 'Test Attendee',
              },
            },
          ],
        },
      ];

      mockCtx.prisma.copy.findMany.mockResolvedValue(copies);

      const expectedCopies = await controller.searchCopies('test', 1, 1);

      expect(expectedCopies.Result.length).toBe(1);
    });
  });
});
