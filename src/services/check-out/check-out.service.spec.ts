import { Test, TestingModule } from '@nestjs/testing';
import { CheckOutService } from './check-out.service';
import { Context, MockContext, createMockContext } from '../prisma/context';
import { CheckOutModule } from '../../modules/check-out/check-out.module';
import { Prisma } from '@prisma/client';

describe('CheckOutService', () => {
  let service: CheckOutService;
  let mockCtx: MockContext;
  let ctx: Context;

  beforeEach(async () => {
    mockCtx = createMockContext();
    ctx = mockCtx as unknown as Context;
    const module: TestingModule = await Test.createTestingModule({
      imports: [CheckOutModule],
    }).compile();

    service = module.get<CheckOutService>(CheckOutService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkout', () => {
    it('should checkout a game', async () => {
      const copy = {
        id: 1,
        gameId: 1,
        winnable: true,
        coverArtOverride: null,
        dateAdded: new Date(),
        dateRetired: null,
        barcodeLabel: '1',
        barcode: '*000001*',
        collectionId: 1,
        winnerId: null,
        comments: null,
        checkOuts: [
          {
            id: 1,
            checkOut: new Date(),
            checkIn: new Date(),
            copyId: 1,
            attendeeId: 1,
          },
        ],
        organizationId: 1,
      };

      const attendee = {
        id: 1,
        conventionId: 1,
        badgeName: 'asdf',
        badgeFirstName: 'asdf',
        badgeLastName: 'asdf',
        legalName: 'asdf',
        userId: null,
        badgeNumber: '1',
        badgeTypeId: 1,
        tteBadgeNumber: 1,
        tteBadgeId: 'xxx',
        email: 'test@geekway.com',
        pronounsId: 1,
        checkedIn: false,
        printed: false,
        registrationCode: 'fakecode',
        barcode: '*000001*',
        checkOuts: [
          {
            id: 1,
            checkOut: new Date(),
            checkIn: new Date(),
            copyId: 1,
            attendeeId: 1,
          },
        ],
        merch: null,
      };

      mockCtx.prisma.attendee.findUnique.mockResolvedValue(attendee);

      mockCtx.prisma.copy.findUnique.mockResolvedValue(copy);

      mockCtx.prisma.checkOut.create.mockResolvedValue({
        id: 1,
        checkOut: new Date(),
        copyId: 1,
        attendeeId: 1,
        checkIn: null,
        submitted: false,
      });

      expect(
        service.checkOut(1, '*00001*', 1, '*000001*', false, ctx, {
          userId: 1,
        }),
      ).resolves.toBeTruthy();
    });

    it('should reject a bad copy', async () => {
      const attendee = {
        id: 1,
        conventionId: 1,
        badgeName: 'asdf',
        badgeFirstName: 'asdf',
        badgeLastName: 'asdf',
        legalName: 'asdf',
        userId: null,
        badgeNumber: '1',
        badgeTypeId: 1,
        tteBadgeNumber: 1,
        tteBadgeId: 'xxx',
        email: 'test@geekway.com',
        pronounsId: 1,
        checkedIn: false,
        printed: false,
        registrationCode: 'fakecode',
        barcode: '*000001*',
        checkOuts: [
          {
            id: 1,
            checkOut: new Date(),
            copyId: 1,
            attendeeId: 1,
          },
        ],
        merch: null,
      };

      mockCtx.prisma.attendee.findUnique.mockResolvedValue(attendee);

      mockCtx.prisma.copy.findUnique.mockResolvedValue(null);

      expect(
        service.checkOut(1, '*000002*', 1, '*000001*', false, ctx, {
          userId: 1,
        }),
      ).rejects.toBe('copy not found');
    });

    it('should reject already checked out', async () => {
      const copy = {
        id: 1,
        gameId: 1,
        winnable: true,
        coverArtOverride: null,
        dateAdded: new Date(),
        dateRetired: null,
        barcodeLabel: '1',
        barcode: '*000001*',
        collectionId: 1,
        winnerId: null,
        comments: null,
        checkOuts: [
          {
            id: 1,
            checkOut: new Date(),
            copyId: 1,
            attendeeId: 1,
          },
        ],
        organizationId: 1,
      };

      const attendee = {
        id: 1,
        conventionId: 1,
        badgeName: 'asdf',
        badgeFirstName: 'asdf',
        badgeLastName: 'asdf',
        legalName: 'asdf',
        userId: null,
        badgeNumber: '1',
        badgeTypeId: 1,
        tteBadgeNumber: 1,
        tteBadgeId: 'xxx',
        email: 'test@geekway.com',
        pronounsId: 1,
        checkedIn: false,
        printed: false,
        registrationCode: 'fakecode',
        barcode: '*000001*',
        checkOuts: [
          {
            id: 1,
            checkOut: new Date(),
            copyId: 1,
            attendeeId: 1,
          },
        ],
        merch: null,
      };

      mockCtx.prisma.attendee.findUnique.mockResolvedValue(attendee);

      mockCtx.prisma.copy.findUnique.mockResolvedValue(copy);

      expect(
        service.checkOut(1, '*00002*', 1, '*000001*', false, ctx, {
          userId: 1,
        }),
      ).rejects.toBe('already checked out');
    });

    it('should reject bad attendee', async () => {
      const copy = {
        id: 1,
        gameId: 1,
        winnable: true,
        coverArtOverride: null,
        dateAdded: new Date(),
        dateRetired: null,
        barcodeLabel: '1',
        barcode: '*000001*',
        collectionId: 1,
        comments: null,
        winnerId: null,
        checkOuts: [
          {
            id: 1,
            checkOut: new Date(),
            copyId: 1,
            attendeeId: 1,
          },
        ],
        organizationId: 1,
      };

      mockCtx.prisma.attendee.findUnique.mockResolvedValue(null);

      mockCtx.prisma.copy.findUnique.mockResolvedValue(copy);

      expect(
        service.checkOut(1, '*00002*', 1, '*000001*', false, ctx, {
          userId: 1,
        }),
      ).rejects.toBe('already checked out');
    });

    it('should reject attendee with a checkout', async () => {
      const copy = {
        id: 1,
        gameId: 1,
        winnable: true,
        coverArtOverride: null,
        dateAdded: new Date(),
        dateRetired: null,
        barcodeLabel: '1',
        barcode: '*000001*',
        collectionId: 1,
        winnerId: null,
        comments: null,
        checkOuts: [
          {
            id: 1,
            checkOut: new Date(),
            checkIn: new Date(),
            copyId: 1,
            attendeeId: 1,
          },
        ],
        organizationId: 1,
      };

      const attendee = {
        id: 1,
        conventionId: 1,
        badgeName: 'asdf',
        badgeFirstName: 'asdf',
        badgeLastName: 'asdf',
        legalName: 'asdf',
        userId: null,
        badgeNumber: '1',
        badgeTypeId: 1,
        tteBadgeId: 'xxx',
        tteBadgeNumber: 1,
        email: 'test@geekway.com',
        pronounsId: 1,
        checkedIn: false,
        printed: false,
        registrationCode: 'fakecode',
        barcode: '*000001*',
        checkOuts: [
          {
            id: 1,
            checkOut: new Date(),
            copyId: 1,
            attendeeId: 1,
          },
        ],
        merch: null,
      };

      mockCtx.prisma.attendee.findUnique.mockResolvedValue(attendee);

      mockCtx.prisma.copy.findUnique.mockResolvedValue(copy);

      expect(
        service.checkOut(1, '*00002*', 1, '*000001*', false, ctx, {
          userId: 1,
        }),
      ).rejects.toBe(
        'attendee already has a game checked out. Game: undefined, Barcode: 1',
      );
    });

    it('should reject bad attendee', async () => {
      const copy = {
        id: 1,
        gameId: 1,
        winnable: true,
        coverArtOverride: null,
        dateAdded: new Date(),
        dateRetired: null,
        barcodeLabel: '1',
        barcode: '*000001*',
        collectionId: 1,
        winnerId: null,
        comments: null,
        checkOuts: [
          {
            id: 1,
            checkOut: new Date(),
            checkIn: new Date(),
            copyId: 1,
            attendeeId: 1,
          },
        ],
        organizationId: 1,
      };

      mockCtx.prisma.attendee.findUnique.mockResolvedValue(null);

      mockCtx.prisma.copy.findUnique.mockResolvedValue(copy);

      expect(
        service.checkOut(1, '*00002*', 1, '*000001*', false, ctx, {
          userId: 1,
        }),
      ).rejects.toBe('attendee not found');
    });
  });

  describe('checkIn', () => {
    it('should checkin a game', async () => {
      const copy = {
        id: 1,
        gameId: 1,
        winnable: true,
        coverArtOverride: null,
        dateAdded: new Date(),
        dateRetired: null,
        barcodeLabel: '1',
        barcode: '*000001*',
        collectionId: 1,
        comments: null,
        winnerId: null,
        checkOuts: [
          {
            id: 1,
            checkOut: new Date(),
            checkIn: null,
            copyId: 1,
            attendeeId: 1,
          },
        ],
        organizationId: 1,
      };

      const checkOut = {
        id: 1,
        checkOut: new Date(),
        checkIn: new Date(),
        copyId: 1,
        attendeeId: 1,
        submitted: false,
      };

      mockCtx.prisma.copy.findUnique.mockResolvedValue(copy);

      mockCtx.prisma.checkOut.update.mockResolvedValue(checkOut);

      const checkIn = await service.checkIn(1, '*000001*', ctx);

      expect(checkIn.checkIn).toBeTruthy();
    });

    it('should copy not found', async () => {
      mockCtx.prisma.copy.findUnique.mockResolvedValue(null);

      expect(service.checkIn(1, '*000001*', ctx)).rejects.toBe(
        'copy not found',
      );
    });

    it('should already be checked in', async () => {
      const copy = {
        id: 1,
        gameId: 1,
        winnable: true,
        coverArtOverride: null,
        dateAdded: new Date(),
        dateRetired: null,
        barcodeLabel: '1',
        barcode: '*000001*',
        collectionId: 1,
        winnerId: null,
        checkOuts: [],
        organizationId: 1,
        comments: null,
      };

      mockCtx.prisma.copy.findUnique.mockResolvedValue(copy);

      expect(service.checkIn(1, '*000001*', ctx)).rejects.toBe(
        'already checked in',
      );
    });
  });

  describe('getLongestCheckouts', () => {
    it('should get some checkouts', async () => {
      mockCtx.prisma.checkOut.findMany.mockResolvedValue([
        {
          id: 1,
          attendeeId: 1,
          checkOut: new Date(),
          checkIn: null,
          copyId: 1,
          submitted: false,
        },
      ]);

      const checkouts = await service.getLongestCheckouts(1, ctx);

      expect(checkouts.length).toBe(1);
    });
  });

  describe('getLongestCheckouts', () => {
    it('should get some checkouts', async () => {
      mockCtx.prisma.checkOut.findMany.mockResolvedValue([
        {
          id: 1,
          attendeeId: 1,
          checkOut: new Date(),
          checkIn: null,
          copyId: 1,
          submitted: false,
        },
      ]);

      const checkouts = await service.getRecentCheckouts(1, ctx);

      expect(checkouts.length).toBe(1);
    });
  });

  describe('submitPrizeEntry', () => {
    it('should fail if not checked in', async () => {
      mockCtx.prisma.checkOut.findUnique.mockResolvedValue({
        id: 1,
        attendeeId: 1,
        checkOut: new Date(),
        checkIn: null,
        copyId: 1,
        submitted: false,
      });

      expect(service.submitPrizeEntry(1, [], ctx)).rejects.toBe(
        'not checked in',
      );
    });

    it('should fail if already submitted', async () => {
      mockCtx.prisma.checkOut.findUnique.mockResolvedValue({
        id: 1,
        attendeeId: 1,
        checkOut: new Date(),
        checkIn: new Date(),
        copyId: 1,
        submitted: true,
      });

      expect(service.submitPrizeEntry(1, [], ctx)).rejects.toBe(
        'already submitted',
      );
    });

    it('should fail if no players', async () => {
      mockCtx.prisma.checkOut.findUnique.mockResolvedValue({
        id: 1,
        attendeeId: 1,
        checkOut: new Date(),
        checkIn: new Date(),
        copyId: 1,
        submitted: false,
      });

      expect(service.submitPrizeEntry(1, [], ctx)).rejects.toBe('no players');
    });

    it('should fail if bad rating', async () => {
      mockCtx.prisma.checkOut.findUnique.mockResolvedValue({
        id: 1,
        attendeeId: 1,
        checkOut: new Date(),
        checkIn: new Date(),
        copyId: 1,
        submitted: false,
      });

      const badPlayer: Prisma.PlayerCreateManyInput = {
        checkOutId: 1,
        attendeeId: 0,
        wantToWin: false,
        rating: 69,
      };

      expect(service.submitPrizeEntry(1, [badPlayer], ctx)).rejects.toBe(
        'invalid rating',
      );
    });

    it('should fail if bad players', async () => {
      mockCtx.prisma.checkOut.findUnique.mockResolvedValue({
        id: 1,
        attendeeId: 1,
        checkOut: new Date(),
        checkIn: new Date(),
        copyId: 1,
        submitted: false,
      });

      const badPlayer: Prisma.PlayerCreateManyInput = {
        checkOutId: 1,
        attendeeId: 0,
        wantToWin: false,
        rating: 5,
      };

      mockCtx.prisma.player.createMany.mockRejectedValue({
        count: 0,
      });

      expect(service.submitPrizeEntry(1, [badPlayer], ctx)).rejects.toBe(
        'failed creating players',
      );
    });

    it('should submit a play', async () => {
      mockCtx.prisma.checkOut.findUnique.mockResolvedValue({
        id: 1,
        attendeeId: 1,
        checkOut: new Date(),
        checkIn: new Date(),
        copyId: 1,
        submitted: false,
      });

      const player: Prisma.PlayerCreateManyInput = {
        checkOutId: 1,
        attendeeId: 1,
        wantToWin: false,
        rating: 5,
      };

      mockCtx.prisma.player.createMany.mockResolvedValue({
        count: 1,
      });

      mockCtx.prisma.checkOut.update.mockResolvedValue({
        id: 1,
        attendeeId: 1,
        checkOut: new Date(),
        checkIn: new Date(),
        copyId: 1,
        submitted: true,
      });

      expect(service.submitPrizeEntry(1, [player], ctx)).resolves.toBeTruthy();
    });
  });

  describe('getAttendeePrizeEntries', () => {
    it('should get attendee prize entries', async () => {
      mockCtx.prisma.checkOut.findMany.mockResolvedValue([
        {
          id: 1,
          attendeeId: 1,
          checkOut: new Date(),
          checkIn: new Date(),
          copyId: 1,
          submitted: false,
        },
      ]);

      expect(
        service.getAttendeePrizeEntries('2410001', ctx),
      ).resolves.toBeTruthy();
    });
  });
});
