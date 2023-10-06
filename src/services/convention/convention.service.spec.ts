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
});
