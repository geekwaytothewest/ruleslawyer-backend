import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConventionService } from './convention.service';
import { MockContext, Context, createMockContext } from '../prisma/context';
import { ConventionModule } from '../../modules/convention/convention.module';

// The convention reads embed the type relation via a scalar select (no Bytes
// logo/logoSquare blobs); mirror that shape here.
const expectedTypeInclude = {
  select: {
    id: true,
    name: true,
    description: true,
    icon: true,
    content: true,
    organizationId: true,
  },
};

describe('ConventionService', () => {
  let service: ConventionService;
  let mockCtx: MockContext;
  let ctx: Context;

  beforeEach(async () => {
    mockCtx = createMockContext();
    ctx = mockCtx as unknown as Context;
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConventionModule],
    }).compile();

    service = module.get<ConventionService>(ConventionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createConvention', () => {
    it('should create a convention', async () => {
      mockCtx.prisma.convention.create.mockResolvedValueOnce({
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
        tteConventionId: '',
      });

      const con = await service.createConvention(
        {
          organization: {
            connect: {
              id: 1,
            },
          },
          name: 'Geekway to the Testing',
          type: {
            connect: {
              id: 1,
            },
          },
          startDate: new Date(),
          endDate: new Date(),
        },
        ctx,
      );

      expect(con.id).toBe(1);
    });
  });

  describe('convention', () => {
    it('should return a convention', async () => {
      mockCtx.prisma.convention.findUnique.mockResolvedValueOnce({
        id: 1,
        organizationId: 1,
        name: 'Test Convention',
        theme: 'Test theme',
        logo: Buffer.from(''),
        logoSquare: Buffer.from(''),
        icon: '',
        startDate: new Date(),
        endDate: new Date(),
        registrationUrl: '',
        typeId: 1,
        annual: '',
        size: null,
        cancelled: false,
        tteConventionId: '',
      });

      const convention = await service.convention(
        {
          id: 1,
        },
        ctx,
      );

      expect(convention?.id).toBe(1);
      const args = mockCtx.prisma.convention.findUnique.mock
        .calls[0][0] as any;
      expect(args.include.type).toEqual(expectedTypeInclude);
    });
  });

  describe('conventionWithUsers', () => {
    it('should return a convention', async () => {
      const query = {
        id: 1,
        organizationId: 1,
        name: 'Test Convention',
        theme: 'Test theme',
        logo: Buffer.from(''),
        logoSquare: Buffer.from(''),
        icon: '',
        startDate: new Date(),
        endDate: new Date(),
        registrationUrl: '',
        typeId: 1,
        annual: '',
        size: null,
        cancelled: false,
        playAndWinAnnounced: false,
        playAndWinWinnersSelected: false,
        playAndWinWinnersAnnounced: false,
        doorPrizesAnnounced: false,
        playAndWinCollectionId: null,
        doorPrizeCollectionId: null,
        tteConventionId: '',
        users: [
          {
            id: 1,
            conventionId: 1,
            admin: true,
            geekGuide: false,
            attendee: false,
            userId: 1,
          },
        ],
      };

      mockCtx.prisma.convention.findUnique.mockResolvedValueOnce(query);

      const convention = await service.conventionWithUsers(
        {
          id: 1,
        },
        ctx,
      );

      expect(convention?.id).toBe(1);
      expect(convention.users.length).toBe(1);
    });
  });

  describe('importAttendees', () => {
    it('should fail with missing tte id', async () => {
      mockCtx.prisma.attendee.deleteMany.mockResolvedValueOnce({ count: 10 });
      mockCtx.prisma.convention.findUnique.mockResolvedValueOnce({
        id: 1,
        typeId: 1,
        organizationId: 1,
        name: 'Test Convention',
        theme: 'Test Theme',
        logo: Buffer.from(''),
        logoSquare: Buffer.from(''),
        icon: '',
        startDate: new Date(),
        endDate: new Date(),
        tteConventionId: null,
        annual: '1st Testable',
        size: 300,
        registrationUrl: 'fakeurl',
        cancelled: false,
      });

      expect(
        service.importAttendees(
          {
            userName: '',
            password: '',
            apiKey: '',
          },
          1,
          ctx,
        ),
      ).rejects.toBe('Convention missing tteConventionId.');
    });

    it('should fail with bad tte login', async () => {
      mockCtx.prisma.attendee.deleteMany.mockResolvedValueOnce({ count: 10 });
      mockCtx.prisma.convention.findUnique.mockResolvedValueOnce({
        id: 1,
        typeId: 1,
        organizationId: 1,
        name: 'Test Convention',
        theme: 'Test Theme',
        logo: Buffer.from(''),
        logoSquare: Buffer.from(''),
        icon: '',
        startDate: new Date(),
        endDate: new Date(),
        tteConventionId: 'fakeid',
        annual: '1st Testable',
        size: 300,
        registrationUrl: 'fakeurl',
        cancelled: false,
      });

      jest
        .spyOn(service['tteService'], 'getSession')
        .mockResolvedValueOnce(null);

      expect(
        service.importAttendees(
          {
            userName: '',
            password: '',
            apiKey: '',
          },
          1,
          ctx,
        ),
      ).rejects.toBe('invalid tte session');
    });

    it('should fail with no badge types', async () => {
      mockCtx.prisma.attendee.deleteMany.mockResolvedValueOnce({ count: 10 });
      mockCtx.prisma.convention.findUnique.mockResolvedValueOnce({
        id: 1,
        typeId: 1,
        organizationId: 1,
        name: 'Test Convention',
        theme: 'Test Theme',
        logo: Buffer.from(''),
        logoSquare: Buffer.from(''),
        icon: '',
        startDate: new Date(),
        endDate: new Date(),
        tteConventionId: 'fakeid',
        annual: '1st Testable',
        size: 300,
        registrationUrl: 'fakeurl',
        cancelled: false,
      });

      jest.spyOn(service['tteService'], 'getSession').mockResolvedValueOnce({
        session_id: 'validsessionmaybelol1',
      });

      jest
        .spyOn(service['tteService'], 'getBadgeTypes')
        .mockResolvedValueOnce([]);

      expect(
        service.importAttendees(
          {
            userName: '',
            password: '',
            apiKey: '',
          },
          1,
          ctx,
        ),
      ).rejects.toBe('no badge types found');
    });

    it('should fail with no badges', async () => {
      mockCtx.prisma.attendee.deleteMany.mockResolvedValueOnce({ count: 10 });
      mockCtx.prisma.convention.findUnique.mockResolvedValueOnce({
        id: 1,
        typeId: 1,
        organizationId: 1,
        name: 'Test Convention',
        theme: 'Test Theme',
        logo: Buffer.from(''),
        logoSquare: Buffer.from(''),
        icon: '',
        startDate: new Date(),
        endDate: new Date(),
        tteConventionId: 'fakeid',
        annual: '1st Testable',
        size: 300,
        registrationUrl: 'fakeurl',
        cancelled: false,
      });

      jest.spyOn(service['tteService'], 'getSession').mockResolvedValueOnce({
        session_id: 'validsessionmaybelol2',
      });

      jest
        .spyOn(service['tteService'], 'getBadgeTypes')
        .mockResolvedValueOnce([{ name: 'bad badge type' }]);

      jest.spyOn(service['tteService'], 'getBadges').mockResolvedValue([]);

      expect(
        service.importAttendees(
          {
            userName: '',
            password: '',
            apiKey: '',
          },
          1,
          ctx,
        ),
      ).rejects.toBe('no badges found');
    });

    it('should import attendees', async () => {
      mockCtx.prisma.attendee.deleteMany.mockResolvedValueOnce({ count: 10 });
      mockCtx.prisma.convention.findUnique.mockResolvedValueOnce({
        id: 1,
        typeId: 1,
        organizationId: 1,
        name: 'Test Convention',
        theme: 'Test Theme',
        logo: Buffer.from(''),
        logoSquare: Buffer.from(''),
        icon: '',
        startDate: new Date(),
        endDate: new Date(),
        tteConventionId: 'fakeid',
        annual: '1st Testable',
        size: 300,
        registrationUrl: 'fakeurl',
        cancelled: false,
      });

      jest.spyOn(service['tteService'], 'getSession').mockResolvedValueOnce({
        session_id: 'validsessionmaybelol2',
      });

      jest
        .spyOn(service['tteService'], 'getBadgeTypes')
        .mockResolvedValueOnce([{ id: 1, name: 'Patron badge type' }]);

      jest.spyOn(service['tteService'], 'getSoldProducts').mockResolvedValue([
        {
          productvariant: {
            name: 'fake product',
          },
        },
        {
          productvariant: {
            name: 'fake product2',
          },
        },
      ]);

      jest.spyOn(service['tteService'], 'getBadges').mockResolvedValue([
        {
          name: 'Test Attendee',
          badgetype_id: 1,
          email: 'test@geekway.com',
          badge_number: 1,
          custom_fields: {
            PreferredPronouns: 'she/her',
          },
        },
      ]);

      expect(
        service.importAttendees(
          {
            userName: '',
            password: '',
            apiKey: '',
          },
          1,
          ctx,
        ),
      ).resolves.toBe(1);
    });

    it('should import attendees with legal names', async () => {
      mockCtx.prisma.attendee.deleteMany.mockResolvedValueOnce({ count: 10 });
      mockCtx.prisma.convention.findUnique.mockResolvedValueOnce({
        id: 1,
        typeId: 1,
        organizationId: 1,
        name: 'Test Convention',
        theme: 'Test Theme',
        logo: Buffer.from(''),
        logoSquare: Buffer.from(''),
        icon: '',
        startDate: new Date(),
        endDate: new Date(),
        tteConventionId: 'fakeid',
        annual: '1st Testable',
        size: 300,
        registrationUrl: 'fakeurl',
        cancelled: false,
      });

      jest.spyOn(service['tteService'], 'getSession').mockResolvedValueOnce({
        session_id: 'validsessionmaybelol2',
      });

      jest
        .spyOn(service['tteService'], 'getBadgeTypes')
        .mockResolvedValueOnce([{ id: 1, name: 'Patron badge type' }]);

      jest.spyOn(service['tteService'], 'getSoldProducts').mockResolvedValue([
        {
          productvariant: {
            name: 'fake product',
          },
        },
        {
          productvariant: {
            name: 'fake product2',
          },
        },
      ]);

      jest.spyOn(service['tteService'], 'getBadges').mockResolvedValue([
        {
          name: 'Test Attendee',
          badgetype_id: 1,
          email: 'test@geekway.com',
          badge_number: 1,
          custom_fields: {
            PreferredPronouns: 'she/her',
            LegalName: 'Test Attendee',
          },
        },
      ]);

      expect(
        service.importAttendees(
          {
            userName: '',
            password: '',
            apiKey: '',
          },
          1,
          ctx,
        ),
      ).resolves.toBe(1);
    });

    it('should fetch sold products convention-wide and group them by badge for multi-badge imports', async () => {
      mockCtx.prisma.attendee.deleteMany.mockResolvedValueOnce({ count: 10 });
      mockCtx.prisma.convention.findUnique.mockResolvedValueOnce({
        id: 1,
        typeId: 1,
        organizationId: 1,
        name: 'Test Convention',
        theme: 'Test Theme',
        logo: Buffer.from(''),
        logoSquare: Buffer.from(''),
        icon: '',
        startDate: new Date(),
        endDate: new Date(),
        tteConventionId: 'fakeid',
        annual: '1st Testable',
        size: 300,
        registrationUrl: 'fakeurl',
        cancelled: false,
      });

      jest.spyOn(service['tteService'], 'getSession').mockResolvedValueOnce({
        session_id: 'validsessionmaybelol2',
      });

      jest
        .spyOn(service['tteService'], 'getBadgeTypes')
        .mockResolvedValueOnce([{ id: 1, name: 'General Admission' }]);

      const perBadgeSpy = jest.spyOn(service['tteService'], 'getSoldProducts');
      const conventionWideSpy = jest
        .spyOn(service['tteService'], 'getConventionSoldProducts')
        .mockResolvedValue([
          { badge_id: 'badge-a', productvariant: { name: 'product A1' } },
          { badge_id: 'badge-b', productvariant: { name: 'product B1' } },
          { badge_id: 'badge-a', productvariant: { name: 'product A2' } },
        ]);

      jest.spyOn(service['tteService'], 'getBadges').mockResolvedValue([
        {
          id: 'badge-a',
          name: 'Attendee A',
          badgetype_id: 1,
          email: 'a@geekway.com',
          badge_number: 1,
          custom_fields: { PreferredPronouns: 'she/her' },
        },
        {
          id: 'badge-b',
          name: 'Attendee B',
          badgetype_id: 1,
          email: 'b@geekway.com',
          badge_number: 2,
          custom_fields: { PreferredPronouns: 'they/them' },
        },
      ]);

      const syncSpy = jest
        .spyOn(service['attendeeService'], 'syncAttendee')
        .mockResolvedValue(undefined as any);

      await expect(
        service.importAttendees(
          { userName: '', password: '', apiKey: '' },
          1,
          ctx,
        ),
      ).resolves.toBe(2);

      // One convention-wide sweep, never a per-badge fetch.
      expect(conventionWideSpy).toHaveBeenCalledTimes(1);
      expect(perBadgeSpy).not.toHaveBeenCalled();

      // Sold products were grouped back onto the correct badge.
      const synced = syncSpy.mock.calls.map((c) => c[0] as any);
      const attendeeA = synced.find((a) => a.email === 'a@geekway.com');
      const attendeeB = synced.find((a) => a.email === 'b@geekway.com');
      expect(attendeeA.merch).toBe('product A1, product A2');
      expect(attendeeB.merch).toBe('product B1');
    });

    it('appends "Patron" to merch for patron badge types without leaving stray separators', async () => {
      mockCtx.prisma.attendee.deleteMany.mockResolvedValueOnce({ count: 10 });
      mockCtx.prisma.convention.findUnique.mockResolvedValueOnce({
        id: 1,
        typeId: 1,
        organizationId: 1,
        name: 'Test Convention',
        theme: 'Test Theme',
        logo: Buffer.from(''),
        logoSquare: Buffer.from(''),
        icon: '',
        startDate: new Date(),
        endDate: new Date(),
        tteConventionId: 'fakeid',
        annual: '1st Testable',
        size: 300,
        registrationUrl: 'fakeurl',
        cancelled: false,
      });

      jest.spyOn(service['tteService'], 'getSession').mockResolvedValueOnce({
        session_id: 'validsessionmaybelol2',
      });

      jest
        .spyOn(service['tteService'], 'getBadgeTypes')
        .mockResolvedValueOnce([{ id: 1, name: 'Patron badge type' }]);

      jest
        .spyOn(service['tteService'], 'getConventionSoldProducts')
        .mockResolvedValue([
          { badge_id: 'badge-a', productvariant: { name: 'product A1' } },
        ]);

      jest.spyOn(service['tteService'], 'getBadges').mockResolvedValue([
        {
          id: 'badge-a',
          name: 'Attendee A',
          badgetype_id: 1,
          email: 'a@geekway.com',
          badge_number: 1,
          custom_fields: { PreferredPronouns: 'she/her' },
        },
        {
          id: 'badge-b',
          name: 'Attendee B',
          badgetype_id: 1,
          email: 'b@geekway.com',
          badge_number: 2,
          custom_fields: { PreferredPronouns: 'they/them' },
        },
      ]);

      const syncSpy = jest
        .spyOn(service['attendeeService'], 'syncAttendee')
        .mockResolvedValue(undefined as any);

      await expect(
        service.importAttendees(
          { userName: '', password: '', apiKey: '' },
          1,
          ctx,
        ),
      ).resolves.toBe(2);

      const synced = syncSpy.mock.calls.map((c) => c[0] as any);
      const attendeeA = synced.find((a) => a.email === 'a@geekway.com');
      const attendeeB = synced.find((a) => a.email === 'b@geekway.com');
      // Patron appended after real products...
      expect(attendeeA.merch).toBe('product A1, Patron');
      // ...and with no products, no leading/trailing separator.
      expect(attendeeB.merch).toBe('Patron');
    });

    it('fetches a single badge when a tteBadgeId is supplied', async () => {
      mockCtx.prisma.convention.findUnique.mockResolvedValueOnce({
        id: 1,
        typeId: 1,
        startDate: new Date('2026-05-01'),
        tteConventionId: 'fakeid',
      } as any);

      jest
        .spyOn(service['tteService'], 'getSession')
        .mockResolvedValueOnce({ session_id: 'valid' });
      jest
        .spyOn(service['tteService'], 'getBadgeTypes')
        .mockResolvedValueOnce([{ id: 1, name: 'Standard' }]);
      const getBadgeSpy = jest
        .spyOn(service['tteService'], 'getBadge')
        .mockResolvedValue({
          id: 'badge-a',
          name: 'Solo Attendee',
          firstname: 'Solo',
          lastname: 'Attendee',
          badgetype_id: 1,
          email: 'solo@geekway.com',
          badge_number: 1,
          custom_fields: { PreferredPronouns: 'she/her' },
        });
      const getBadgesSpy = jest.spyOn(service['tteService'], 'getBadges');
      jest
        .spyOn(service['tteService'], 'getSoldProducts')
        .mockResolvedValue([]);
      jest
        .spyOn(service['attendeeService'], 'syncAttendee')
        .mockResolvedValue(undefined as any);

      await expect(
        service.importAttendees(
          {
            userName: '',
            password: '',
            apiKey: '',
            tteBadgeId: 'badge-a',
            tteBadgeNumber: 1,
          },
          1,
          ctx,
        ),
      ).resolves.toBe(1);

      // The single-badge path uses getBadge, not the full badge list.
      expect(getBadgeSpy).toHaveBeenCalled();
      expect(getBadgesSpy).not.toHaveBeenCalled();
    });

    it('logs a status update every hundredth badge', async () => {
      mockCtx.prisma.convention.findUnique.mockResolvedValueOnce({
        id: 1,
        typeId: 1,
        startDate: new Date('2026-05-01'),
        tteConventionId: 'fakeid',
      } as any);

      jest
        .spyOn(service['tteService'], 'getSession')
        .mockResolvedValueOnce({ session_id: 'valid' });
      jest
        .spyOn(service['tteService'], 'getBadgeTypes')
        .mockResolvedValueOnce([{ id: 1, name: 'Standard' }]);
      jest
        .spyOn(service['tteService'], 'getConventionSoldProducts')
        .mockResolvedValue([]);

      // 100 badges so the count % 100 === 0 status-log branch is hit.
      const badges = Array.from({ length: 100 }, (_, i) => ({
        id: `badge-${i}`,
        name: `Attendee ${i}`,
        badgetype_id: 1,
        email: `a${i}@geekway.com`,
        badge_number: i + 1,
        custom_fields: {},
      }));
      jest.spyOn(service['tteService'], 'getBadges').mockResolvedValue(badges);
      jest
        .spyOn(service['attendeeService'], 'syncAttendee')
        .mockResolvedValue(undefined as any);

      await expect(
        service.importAttendees(
          { userName: '', password: '', apiKey: '' },
          1,
          ctx,
        ),
      ).resolves.toBe(100);
    });

    it('rejects when the convention lookup fails', async () => {
      mockCtx.prisma.convention.findUnique.mockRejectedValueOnce(
        new Error('db error'),
      );

      await expect(
        service.importAttendees(
          { userName: '', password: '', apiKey: '' },
          1,
          ctx,
        ),
      ).rejects.toThrow('db error');
    });
  });

  describe('startImportAttendees', () => {
    it('launches the import in the background and returns "started"', () => {
      const spy = jest
        .spyOn(service, 'importAttendees')
        .mockResolvedValue(1 as any);

      const userData = { userName: '', password: '', apiKey: '' };
      const result = service.startImportAttendees(userData, 1, ctx);

      expect(result.status).toBe('started');
      expect(spy).toHaveBeenCalledWith(userData, 1, ctx);
    });

    it('rejects a second concurrent import with 409', () => {
      // First launch never settles, so the in-flight flag stays set.
      jest
        .spyOn(service, 'importAttendees')
        .mockReturnValue(new Promise(() => {}) as any);

      service.startImportAttendees({ userName: '', password: '', apiKey: '' }, 1, ctx);

      expect(() =>
        service.startImportAttendees({ userName: '', password: '', apiKey: '' }, 1, ctx),
      ).toThrow(ConflictException);
    });
  });

  describe('startImportAttendeesCSV', () => {
    it('launches the csv import in the background and returns "started"', () => {
      const spy = jest
        .spyOn(service, 'importAttendeesCSV')
        .mockResolvedValue(1 as any);

      const buffer = Buffer.from('Ada,Lovelace,101\n');
      const result = service.startImportAttendeesCSV(buffer, 1, ctx);

      expect(result.status).toBe('started');
      expect(spy).toHaveBeenCalledWith(buffer, 1, ctx);
    });

    it('rejects a concurrent import (shared with TTE) with 409', () => {
      jest
        .spyOn(service, 'importAttendees')
        .mockReturnValue(new Promise(() => {}) as any);
      const csvSpy = jest.spyOn(service, 'importAttendeesCSV');

      // A TTE import is already in flight...
      service.startImportAttendees({ userName: '', password: '', apiKey: '' }, 1, ctx);

      // ...so a CSV import is refused and never launched.
      expect(() =>
        service.startImportAttendeesCSV(Buffer.from(''), 1, ctx),
      ).toThrow(ConflictException);
      expect(csvSpy).not.toHaveBeenCalled();
    });
  });

  describe('checkOutGame', () => {
    it('should check out a game', async () => {
      const copy = {
        id: 1,
        gameId: 1,
        winnable: true,
        coverArtOverride: null,
        bggVersionOverride: null,
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
        eligibleForPrizes: true,
        lostBadge: false,
      };

      mockCtx.prisma.attendee.findUnique.mockResolvedValue(attendee);

      mockCtx.prisma.copy.findUnique.mockResolvedValue(copy);

      mockCtx.prisma.checkOut.create.mockResolvedValue({
        id: 1,
        checkOut: new Date(),
        checkIn: null,
        copyId: 1,
        attendeeId: 1,
        submitted: false,
      });

      expect(
        service.checkOutGame(1, '*000001*', '*000001*', 1, ctx, { userId: 1 }),
      ).resolves.toBeTruthy();
    });
  });

  describe('exportBadgeFile', () => {
    it('should export a badge file', async () => {
      mockCtx.prisma.attendee.findMany.mockResolvedValue([
        {
          id: 1,
          conventionId: 1,
          badgeNumber: '1',
          barcode: '*000001*',
          tteBadgeNumber: 1,
          tteBadgeId: 'xxx',
          pronounsId: 1,
          badgeName: 'asdf',
          badgeFirstName: 'asdf',
          badgeLastName: 'asdf',
          legalName: 'asdf',
          userId: null,
          badgeTypeId: 1,
          email: 'test@geekway.com',
          checkedIn: false,
          printed: false,
          registrationCode: 'fakecode',
          merch: null,
          eligibleForPrizes: true,
          lostBadge: false,
        },
        {
          id: 1,
          conventionId: 1,
          badgeNumber: '2',
          barcode: '*000002*',
          tteBadgeNumber: 2,
          tteBadgeId: 'xxx',
          pronounsId: 1,
          badgeName: 'asdf',
          badgeFirstName: 'asdf',
          badgeLastName: 'asdf',
          legalName: 'asdf',
          userId: null,
          badgeTypeId: 1,
          email: 'test@geekway.com',
          checkedIn: false,
          printed: false,
          registrationCode: 'fakecode',
          merch: null,
          eligibleForPrizes: true,
          lostBadge: false,
        },
      ]);

      expect(service.exportBadgeFile(1, ctx)).resolves.toBeTruthy();
    });
  });

  describe('updateConvention', () => {
    it('should update a convention', async () => {
      mockCtx.prisma.convention.update.mockResolvedValue({ id: 1 } as any);

      const result = await service.updateConvention(1, { name: 'New' }, ctx);

      expect(result.id).toBe(1);
      expect(mockCtx.prisma.convention.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'New' },
      });
    });
  });

  describe('conventionsByOrg', () => {
    it('should return conventions for an org ordered by start date', async () => {
      mockCtx.prisma.convention.findMany.mockResolvedValue([{ id: 1 }] as any);

      const result = await service.conventionsByOrg(1, ctx);

      expect(result.length).toBe(1);
      expect(mockCtx.prisma.convention.findMany).toHaveBeenCalledWith({
        where: { organizationId: 1 },
        include: { type: expectedTypeInclude },
        orderBy: { startDate: 'desc' },
      });
    });
  });

  describe('conventions', () => {
    it('should return conventions visible to the user', async () => {
      mockCtx.prisma.convention.findMany.mockResolvedValue([{ id: 1 }] as any);

      const result = await service.conventions({ id: 1 }, ctx);

      expect(result.length).toBe(1);
      const args = mockCtx.prisma.convention.findMany.mock.calls[0][0] as any;
      expect(args.where.OR).toHaveLength(2);
      expect(args.include).toEqual({ type: expectedTypeInclude });
      expect(args.orderBy).toEqual({ startDate: 'desc' });
    });

    it('should return every convention for a super admin', async () => {
      mockCtx.prisma.convention.findMany.mockResolvedValue([
        { id: 1 },
        { id: 2 },
      ] as any);

      const result = await service.conventions(
        { id: 1, superAdmin: true },
        ctx,
      );

      expect(result.length).toBe(2);
      const args = mockCtx.prisma.convention.findMany.mock.calls[0][0] as any;
      expect(args.where).toBeUndefined();
      expect(args.include).toEqual({ type: expectedTypeInclude });
      expect(args.orderBy).toEqual({ startDate: 'desc' });
    });
  });

  describe('attachCollection', () => {
    it('should link a collection to a convention', async () => {
      mockCtx.prisma.conventionCollections.create.mockResolvedValue({
        conventionId: 1,
        collectionId: 2,
      } as any);

      const result = await service.attachCollection(1, 2, ctx);

      expect(result.collectionId).toBe(2);
      expect(mockCtx.prisma.conventionCollections.create).toHaveBeenCalledWith({
        data: { collectionId: 2, conventionId: 1 },
      });
    });
  });

  describe('detachCollection', () => {
    it('should unlink a collection from a convention', async () => {
      mockCtx.prisma.conventionCollections.delete.mockResolvedValue({
        conventionId: 1,
        collectionId: 2,
      } as any);

      const result = await service.detachCollection(1, 2, ctx);

      expect(result.collectionId).toBe(2);
      expect(mockCtx.prisma.conventionCollections.delete).toHaveBeenCalledWith({
        where: {
          conventionId_collectionId: { collectionId: 2, conventionId: 1 },
        },
      });
    });
  });

  describe('importAttendeesCSV', () => {
    it('should import each row as an attendee and resolve the count', async () => {
      mockCtx.prisma.attendee.create.mockResolvedValue({ id: 1 } as any);

      const csv = 'Ada,Lovelace,101\nGrace,Hopper,102\n';

      const count = await service.importAttendeesCSV(csv, 1, ctx);

      expect(count).toBe(2);
      expect(mockCtx.prisma.attendee.create).toHaveBeenCalledTimes(2);
    });

    it('should keep going when an individual attendee fails to import', async () => {
      mockCtx.prisma.attendee.create
        .mockRejectedValueOnce(new Error('dup badge'))
        .mockResolvedValueOnce({ id: 2 } as any);

      const csv = 'Ada,Lovelace,101\nGrace,Hopper,102\n';

      const count = await service.importAttendeesCSV(csv, 1, ctx);

      expect(count).toBe(1);
    });

    it('should reject on an invalid csv', async () => {
      await expect(
        service.importAttendeesCSV('"unterminated', 1, ctx),
      ).rejects.toBe('invalid csv file');
    });
  });

  describe('error handling', () => {
    // Methods that return the prisma call without awaiting it only reach their
    // catch on a synchronous throw.
    const boom = () => {
      throw new Error('db error');
    };

    it('createConvention rejects when the create throws', async () => {
      mockCtx.prisma.convention.create.mockRejectedValue(
        new Error('db error'),
      );
      await expect(
        service.createConvention(
          { organization: { connect: { id: 1 } } } as any,
          ctx,
        ),
      ).rejects.toThrow('db error');
    });

    it('convention rejects when the query throws', async () => {
      mockCtx.prisma.convention.findUnique.mockImplementation(boom as any);
      await expect(service.convention({ id: 1 }, ctx)).rejects.toThrow(
        'db error',
      );
    });

    it('conventionWithUsers rejects when the query throws', async () => {
      mockCtx.prisma.convention.findUnique.mockImplementation(boom as any);
      await expect(
        service.conventionWithUsers({ id: 1 }, ctx),
      ).rejects.toThrow('db error');
    });

    it('updateConvention rejects when the update throws', async () => {
      mockCtx.prisma.convention.update.mockImplementation(boom as any);
      await expect(
        service.updateConvention(1, {}, ctx),
      ).rejects.toThrow('db error');
    });

    it('conventionsByOrg rejects when the query throws', async () => {
      mockCtx.prisma.convention.findMany.mockImplementation(boom as any);
      await expect(service.conventionsByOrg(1, ctx)).rejects.toThrow(
        'db error',
      );
    });

    it('conventions rejects when the query throws', async () => {
      mockCtx.prisma.convention.findMany.mockImplementation(boom as any);
      await expect(service.conventions({ id: 1 }, ctx)).rejects.toThrow(
        'db error',
      );
    });

    it('attachCollection rejects when the create throws', async () => {
      mockCtx.prisma.conventionCollections.create.mockImplementation(
        boom as any,
      );
      await expect(service.attachCollection(1, 2, ctx)).rejects.toThrow(
        'db error',
      );
    });

    it('detachCollection rejects when the delete throws', async () => {
      mockCtx.prisma.conventionCollections.delete.mockImplementation(
        boom as any,
      );
      await expect(service.detachCollection(1, 2, ctx)).rejects.toThrow(
        'db error',
      );
    });

    it('exportBadgeFile rejects when the attendee lookup fails', async () => {
      mockCtx.prisma.attendee.findMany.mockRejectedValue(new Error('db error'));
      await expect(service.exportBadgeFile(1, ctx)).rejects.toThrow('db error');
    });

    it('checkOutGame rejects when the checkout throws synchronously', async () => {
      jest
        .spyOn(service['checkOutService'], 'checkOut')
        .mockImplementation(boom as any);
      await expect(
        service.checkOutGame(1, 'bc', 'abc', 1, ctx, { id: 1 }),
      ).rejects.toThrow('db error');
    });

    it('importAttendeesCSV rejects when parsing throws synchronously', async () => {
      // A non-string/buffer input makes the csv parser throw synchronously,
      // reaching the executor's outer catch.
      await expect(
        service.importAttendeesCSV({} as any, 1, ctx),
      ).rejects.toBeDefined();
    });

    it('startImportAttendees logs and clears the flag when the background import fails', async () => {
      // Reject with a non-Error so the `error?.message ?? error` fallback runs.
      jest
        .spyOn(service, 'importAttendees')
        .mockRejectedValue('background boom');
      const errorSpy = jest.spyOn(service['logger'], 'error');

      service.startImportAttendees({ userName: '', password: '', apiKey: '' }, 1, ctx);

      // Let the fire-and-forget promise settle.
      await new Promise((r) => setImmediate(r));

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Background attendee import (TTE) failed'),
      );
      // The in-progress flag clears, so a new import can start.
      expect(service['importInProgress']).toBe(false);
    });

    it('startImportAttendeesCSV logs and clears the flag when the background import fails', async () => {
      jest
        .spyOn(service, 'importAttendeesCSV')
        .mockRejectedValue('background boom');
      const errorSpy = jest.spyOn(service['logger'], 'error');

      service.startImportAttendeesCSV(Buffer.from(''), 1, ctx);

      await new Promise((r) => setImmediate(r));

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Background attendee import (CSV) failed'),
      );
      expect(service['importInProgress']).toBe(false);
    });
  });

  describe('getAttendees', () => {
    // getAttendees runs findMany + count inside a single $transaction and
    // returns a pagination envelope; stub the transaction to resolve [rows, total].
    function mockPage(rows: unknown[], total: number) {
      mockCtx.prisma.$transaction.mockResolvedValue([rows, total] as never);
    }

    it('returns a pagination envelope with the default page size', async () => {
      mockPage([{ id: 1 }], 1);

      const result = await service.getAttendees(5, 50, '', 1, ctx);

      expect(result).toEqual({
        data: [{ id: 1 }],
        total: 1,
        page: 1,
        pageSize: 50,
        totalPages: 1,
        hasMore: false,
      });
    });

    it('scopes to the convention and orders by last then first name', async () => {
      mockPage([], 0);

      await service.getAttendees(5, 50, '', 1, ctx);

      expect(mockCtx.prisma.attendee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { conventionId: 5 },
          orderBy: [{ badgeLastName: 'asc' }, { badgeFirstName: 'asc' }],
          include: { pronouns: true, badgeType: true },
          take: 50,
          skip: 0,
        }),
      );
    });

    it('clamps the page size to the 500 cap', async () => {
      mockPage([], 0);

      const result = await service.getAttendees(5, 1000, '', 1, ctx);

      expect(result.pageSize).toBe(500);
      expect(mockCtx.prisma.attendee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 500 }),
      );
    });

    it('falls back to the cap when the limit is not a number', async () => {
      mockPage([], 0);

      const result = await service.getAttendees(5, NaN, '', 1, ctx);

      expect(result.pageSize).toBe(500);
    });

    it('offsets by page: skip = (page - 1) * pageSize', async () => {
      mockPage([], 0);

      const result = await service.getAttendees(5, 50, '', 3, ctx);

      expect(result.page).toBe(3);
      expect(mockCtx.prisma.attendee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 100 }),
      );
    });

    it('treats a page below 1 as the first page', async () => {
      mockPage([], 0);

      const result = await service.getAttendees(5, 50, '', 0, ctx);

      expect(result.page).toBe(1);
      expect(mockCtx.prisma.attendee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0 }),
      );
    });

    it('computes totalPages and hasMore from the count', async () => {
      mockPage([{ id: 1 }], 120);

      const result = await service.getAttendees(5, 50, '', 1, ctx);

      expect(result.totalPages).toBe(3);
      expect(result.hasMore).toBe(true);
    });

    it('reports no more pages on the last page', async () => {
      mockPage([{ id: 1 }], 120);

      const result = await service.getAttendees(5, 50, '', 3, ctx);

      expect(result.hasMore).toBe(false);
    });

    it('leaves the where unfiltered when no filter is supplied', async () => {
      mockPage([], 0);

      await service.getAttendees(5, 50, '', 1, ctx);

      expect(mockCtx.prisma.attendee.count).toHaveBeenCalledWith({
        where: { conventionId: 5 },
      });
    });

    it('ANDs name-search clauses onto the convention scope when filtering', async () => {
      mockPage([], 0);

      await service.getAttendees(5, 50, 'ada', 1, ctx);

      const call = mockCtx.prisma.attendee.findMany.mock.calls[0][0] as {
        where: { AND: [unknown, { OR: unknown[] }] };
      };
      // Convention scoping is preserved as the first AND branch...
      expect(call.where.AND[0]).toEqual({ conventionId: 5 });
      // ...and the name filter is OR-ed across the ILIKE + full-text clauses.
      expect(call.where.AND[1].OR).toContainEqual({
        badgeName: { contains: 'ada', mode: 'insensitive' },
      });
      expect(call.where.AND[1].OR).toContainEqual({
        badgeName: { search: 'ada' },
      });
      // count uses the same filtered where.
      expect(mockCtx.prisma.attendee.count).toHaveBeenCalledWith({
        where: call.where,
      });
    });

    it('omits the full-text search clauses when the filter is pure punctuation', async () => {
      mockPage([], 0);

      await service.getAttendees(5, 50, '   ', 1, ctx);

      // A whitespace-only filter is still truthy, so the ILIKE clauses apply,
      // but no `search` lexeme survives tokenizing.
      const call = mockCtx.prisma.attendee.findMany.mock.calls[0][0] as {
        where: { AND: [unknown, { OR: { badgeName?: { search?: string } }[] }] };
      };
      const hasSearch = call.where.AND[1].OR.some(
        (c) => c.badgeName != null && 'search' in c.badgeName,
      );
      expect(hasSearch).toBe(false);
    });

    it('tolerates a missing filter without scoping the name search', async () => {
      mockPage([], 0);

      const result = await service.getAttendees(5, 50, undefined as never, 1, ctx);

      expect(result.total).toBe(0);
      expect(mockCtx.prisma.attendee.count).toHaveBeenCalledWith({
        where: { conventionId: 5 },
      });
    });

    it('rejects when the transaction throws', async () => {
      mockCtx.prisma.$transaction.mockRejectedValue(new Error('db error'));

      await expect(service.getAttendees(5, 50, '', 1, ctx)).rejects.toThrow(
        'db error',
      );
    });
  });
});
