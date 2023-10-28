import { Test, TestingModule } from '@nestjs/testing';
import { ConventionService } from './convention.service';
import { MockContext, Context, createMockContext } from '../prisma/context';
import { ConventionModule } from '../../modules/convention/convention.module';

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
      const organization = {
        id: 1,
        name: 'Geekway to the Testing',
        ownerId: 1,
        users: [
          {
            id: 1,
            organizationId: 1,
            admin: true,
            geekGuide: false,
            readOnly: false,
            userId: 1,
          },
        ],
        owner: {
          id: 1,
        },
      };

      mockCtx.prisma.organization.findUnique.mockResolvedValueOnce(
        organization,
      );

      mockCtx.prisma.convention.create.mockResolvedValueOnce({
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
        playAndWinAnnounced: false,
        playAndWinWinnersSelected: false,
        playAndWinWinnersAnnounced: false,
        doorPrizesAnnounced: false,
        playAndWinCollectionId: null,
        doorPrizeCollectionId: null,
        tteConventionId: '',
      });

      const convention = await service.convention(
        {
          id: 1,
        },
        ctx,
      );

      expect(convention?.id).toBe(1);
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

      const convention = await service.convention(
        {
          id: 1,
        },
        ctx,
      );

      expect(convention?.id).toBe(1);
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
        playAndWinAnnounced: false,
        playAndWinCollectionId: null,
        playAndWinWinnersSelected: false,
        doorPrizeCollectionId: null,
        doorPrizesAnnounced: false,
        cancelled: false,
        playAndWinWinnersAnnounced: false,
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
        playAndWinAnnounced: false,
        playAndWinCollectionId: null,
        playAndWinWinnersSelected: false,
        doorPrizeCollectionId: null,
        doorPrizesAnnounced: false,
        cancelled: false,
        playAndWinWinnersAnnounced: false,
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
        playAndWinAnnounced: false,
        playAndWinCollectionId: null,
        playAndWinWinnersSelected: false,
        doorPrizeCollectionId: null,
        doorPrizesAnnounced: false,
        cancelled: false,
        playAndWinWinnersAnnounced: false,
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
        playAndWinAnnounced: false,
        playAndWinCollectionId: null,
        playAndWinWinnersSelected: false,
        doorPrizeCollectionId: null,
        doorPrizesAnnounced: false,
        cancelled: false,
        playAndWinWinnersAnnounced: false,
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
        playAndWinAnnounced: false,
        playAndWinCollectionId: null,
        playAndWinWinnersSelected: false,
        doorPrizeCollectionId: null,
        doorPrizesAnnounced: false,
        cancelled: false,
        playAndWinWinnersAnnounced: false,
      });

      jest.spyOn(service['tteService'], 'getSession').mockResolvedValueOnce({
        session_id: 'validsessionmaybelol2',
      });

      jest
        .spyOn(service['tteService'], 'getBadgeTypes')
        .mockResolvedValueOnce([{ id: 1, name: 'bad badge type' }]);

      jest.spyOn(service['tteService'], 'getSoldProducts').mockResolvedValue([
        {
          productvariant: {
            name: 'fake product',
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
  });

  describe('checkOutGame', () => {
    it('should check out a game', async () => {
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
        checkIn: null,
        copyId: 1,
        attendeeId: 1,
      });

      expect(
        service.checkOutGame(1, '*000001*', '*000001*', 1, ctx),
      ).resolves.toBeTruthy();
    });
  });
});
