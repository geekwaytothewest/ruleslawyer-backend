import { Test, TestingModule } from '@nestjs/testing';
import { CheckOutService } from './check-out.service';
import { Context, MockContext, createMockContext } from '../prisma/context';
import { CheckOutModule } from '../../modules/check-out/check-out.module';

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
        checkOuts: [
          {
            id: 1,
            checkOut: new Date(),
            checkIn: new Date(),
            copyId: 1,
            attendeeId: 1,
          },
        ],
      };

      const attendee = {
        id: 1,
        conventionId: 1,
        name: 'Test Attendee',
        userId: null,
        badgeNumber: '1',
        badgeTypeId: 1,
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
            checkIn: new Date(),
            copyId: 1,
            attendeeId: 1,
          },
        ],
      };

      mockCtx.prisma.attendee.findUnique.mockResolvedValue(attendee);

      mockCtx.prisma.copy.findUnique.mockResolvedValue(copy);

      mockCtx.prisma.checkOut.create.mockResolvedValue({
        id: 1,
        checkOut: new Date(),
        copyId: 1,
        attendeeId: 1,
        checkIn: null,
      });

      expect(
        service.checkOut(1, '*00001*', 1, '*000001*', false, ctx),
      ).resolves.toBeTruthy();
    });

    it('should reject a bad copy', async () => {
      const attendee = {
        id: 1,
        conventionId: 1,
        name: 'Test Attendee',
        userId: null,
        badgeNumber: '1',
        badgeTypeId: 1,
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
      };

      mockCtx.prisma.attendee.findUnique.mockResolvedValue(attendee);

      mockCtx.prisma.copy.findUnique.mockResolvedValue(null);

      expect(
        service.checkOut(1, '*000002*', 1, '*000001*', false, ctx),
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
        checkOuts: [
          {
            id: 1,
            checkOut: new Date(),
            copyId: 1,
            attendeeId: 1,
          },
        ],
      };

      const attendee = {
        id: 1,
        conventionId: 1,
        name: 'Test Attendee',
        userId: null,
        badgeNumber: '1',
        badgeTypeId: 1,
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
      };

      mockCtx.prisma.attendee.findUnique.mockResolvedValue(attendee);

      mockCtx.prisma.copy.findUnique.mockResolvedValue(copy);

      expect(
        service.checkOut(1, '*00002*', 1, '*000001*', false, ctx),
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
        winnerId: null,
        checkOuts: [
          {
            id: 1,
            checkOut: new Date(),
            copyId: 1,
            attendeeId: 1,
          },
        ],
      };

      mockCtx.prisma.attendee.findUnique.mockResolvedValue(null);

      mockCtx.prisma.copy.findUnique.mockResolvedValue(copy);

      expect(
        service.checkOut(1, '*00002*', 1, '*000001*', false, ctx),
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
        checkOuts: [
          {
            id: 1,
            checkOut: new Date(),
            checkIn: new Date(),
            copyId: 1,
            attendeeId: 1,
          },
        ],
      };

      const attendee = {
        id: 1,
        conventionId: 1,
        name: 'Test Attendee',
        userId: null,
        badgeNumber: '1',
        badgeTypeId: 1,
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
      };

      mockCtx.prisma.attendee.findUnique.mockResolvedValue(attendee);

      mockCtx.prisma.copy.findUnique.mockResolvedValue(copy);

      expect(
        service.checkOut(1, '*00002*', 1, '*000001*', false, ctx),
      ).rejects.toBe('attendee already has a game checked out');
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
        checkOuts: [
          {
            id: 1,
            checkOut: new Date(),
            checkIn: new Date(),
            copyId: 1,
            attendeeId: 1,
          },
        ],
      };

      mockCtx.prisma.attendee.findUnique.mockResolvedValue(null);

      mockCtx.prisma.copy.findUnique.mockResolvedValue(copy);

      expect(
        service.checkOut(1, '*00002*', 1, '*000001*', false, ctx),
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
      };

      const checkOut = {
        id: 1,
        checkOut: new Date(),
        checkIn: new Date(),
        copyId: 1,
        attendeeId: 1,
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
      };

      mockCtx.prisma.copy.findUnique.mockResolvedValue(copy);

      expect(service.checkIn(1, '*000001*', ctx)).rejects.toBe(
        'already checked in',
      );
    });
  });
});
