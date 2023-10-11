import { Test, TestingModule } from '@nestjs/testing';
import { ConventionService } from './convention.service';
import { OrganizationService } from '../organization/organization.service';
import { AttendeeService } from '../attendee/attendee.service';
import { TabletopeventsService } from '../tabletopevents/tabletopevents.service';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from '../prisma/prisma.service';
import { MockContext, Context, createMockContext } from '../prisma/context';

describe('ConventionService', () => {
  let service: ConventionService;
  let mockCtx: MockContext;
  let ctx: Context;

  beforeEach(async () => {
    mockCtx = createMockContext();
    ctx = mockCtx as unknown as Context;
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        ConventionService,
        OrganizationService,
        AttendeeService,
        TabletopeventsService,
        PrismaService,
      ],
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

      mockCtx.prisma.organization.findUnique.mockResolvedValue(organization);

      mockCtx.prisma.convention.create.mockResolvedValue({
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
      });

      const con = await service.createConvention(
        {
          organization: {
            connect: {
              id: 1,
            },
          },
          name: 'Geekway to the Testing',
        },
        ctx,
      );

      expect(con.id).toBe(1);
    });
  });

  describe('convention', () => {
    it('should return a convention', async () => {
      mockCtx.prisma.convention.findUnique.mockResolvedValue({
        id: 1,
        organizationId: 1,
        name: 'Test Convention',
        theme: 'Test theme',
        logo: Buffer.from(''),
        logoSquare: Buffer.from(''),
        icon: '',
        startDate: new Date(),
        endDate: null,
        registrationUrl: '',
        typeId: null,
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
        endDate: null,
        registrationUrl: '',
        typeId: null,
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

      mockCtx.prisma.convention.findUnique.mockResolvedValue(query);

      const convention = await service.convention(
        {
          id: 1,
        },
        ctx,
      );

      expect(convention?.id).toBe(1);
    });

    describe('importAttendees', () => {
      it('should fail with missing tte id', async () => {
        mockCtx.prisma.convention.findUnique.mockResolvedValue({
          id: 1,
          typeId: 1,
          organizationId: 1,
          name: 'Test Convention',
          theme: 'Test Theme',
          logo: Buffer.from(''),
          logoSquare: Buffer.from(''),
          icon: '',
          startDate: new Date(),
          endDate: null,
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
        ).rejects.toThrow('Convention missing tteConventionId.');
      });
    });
  });
});
