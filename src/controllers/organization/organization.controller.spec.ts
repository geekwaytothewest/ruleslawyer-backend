import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationController } from './organization.controller';
import { PrismaService } from '../../services/prisma/prisma.service';
import { OrganizationService } from '../../services/organization/organization.service';
import { ConventionService } from '../../services/convention/convention.service';
import { TabletopeventsService } from '../../services/tabletopevents/tabletopevents.service';
import { AttendeeService } from '../../services/attendee/attendee.service';
import { HttpModule } from '@nestjs/axios';
import {
  Context,
  MockContext,
  createMockContext,
} from '../../services/prisma/context';

describe('OrganizationController', () => {
  let controller: OrganizationController;
  let mockCtx: MockContext;
  let ctx: Context;

  beforeEach(async () => {
    mockCtx = createMockContext();
    ctx = mockCtx as unknown as Context;
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      controllers: [OrganizationController],
      providers: [
        PrismaService,
        OrganizationService,
        ConventionService,
        TabletopeventsService,
        AttendeeService,
      ],
    }).compile();

    controller = module.get<OrganizationController>(OrganizationController);
    controller.ctx = ctx;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createOrganization', () => {
    it('should create a organization object', async () => {
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
      };

      const mockRequest = (<unknown>{
        user: {
          user: {
            id: 1,
          },
        },
      }) as Request;

      mockCtx.prisma.organization.create.mockResolvedValue(organization);

      const org = await controller.createOrganization(
        {
          name: 'Geekway to the Testing',
        },
        mockRequest,
      );

      expect(org.name).toBe('Geekway to the Testing');
    });
  });

  describe('createConvention', () => {
    it('should return a convention object', async () => {
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

      const organization = {
        id: 1,
        name: 'Geekeway to the Testing',
        ownerId: 1,
        users: [
          {
            id: 1,
            organizationId: 1,
            admin: true,
            geekGuide: false,
            readyOnly: false,
            userId: 1,
          },
        ],
        owner: {
          id: 1,
          name: 'Test User',
        },
      };

      mockCtx.prisma.convention.create.mockResolvedValue(convention);
      mockCtx.prisma.organization.findUnique.mockResolvedValue(organization);

      const con = await controller.createConvention(
        {
          name: 'Geekway to the Testing',
          organization: {},
        },
        1,
      );

      expect(con.name).toBe('Geekway to the Testing');
    });
  });
});
