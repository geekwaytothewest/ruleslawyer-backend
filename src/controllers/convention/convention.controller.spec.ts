import { Test, TestingModule } from '@nestjs/testing';
import { ConventionController } from './convention.controller';
import { ConventionService } from '../../services/convention/convention.service';
import { OrganizationService } from '../../services/organization/organization.service';
import { AttendeeService } from '../../services/attendee/attendee.service';
import { TabletopeventsService } from '../../services/tabletopevents/tabletopevents.service';
import { PrismaService } from '../../services/prisma/prisma.service';
import { HttpModule } from '@nestjs/axios';
import {
  Context,
  MockContext,
  createMockContext,
} from '../../services/prisma/context';

describe('ConventionController', () => {
  let controller: ConventionController;
  let mockCtx: MockContext;
  let ctx: Context;

  beforeEach(async () => {
    mockCtx = createMockContext();
    ctx = mockCtx as unknown as Context;
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      controllers: [ConventionController],
      providers: [
        ConventionService,
        OrganizationService,
        AttendeeService,
        {
          provide: TabletopeventsService,
          useValue: {
            importAttendees: jest.fn().mockImplementation(() => 1),
            getSession: jest.fn().mockImplementation(() => 'fake session'),
            getBadgeTypes: jest.fn().mockImplementation(() => [
              {
                name: 'fake badge type',
              },
            ]),
            getBadges: jest.fn().mockImplementation(() => [
              {
                name: 'fake name',
                badge_number: 1,
                email: 'fake@email.com',
                custom_fields: {
                  PreferredPronouns: 'she/her',
                },
              },
            ]),
          },
        },
        PrismaService,
      ],
    }).compile();

    controller = module.get<ConventionController>(ConventionController);
    controller.ctx = ctx;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

      mockCtx.prisma.organization.findUnique.mockResolvedValue(organization);

      mockCtx.prisma.convention.create.mockResolvedValue(convention);

      const createConvention = await controller.createConvention({
        name: 'Geekway to the Testing',
        organization: {
          connect: {
            id: 1,
          },
        },
      });

      expect(createConvention.name).toBe('Geekway to the Testing');
    });
  });

  describe('getConvention', () => {
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

      mockCtx.prisma.convention.findUnique.mockResolvedValue(convention);

      const getConvention = await controller.getConvention(1);

      expect(getConvention.id).toBe(1);
    });
  });

  describe('updateConvention', () => {
    it('should update', async () => {
      const convention = {
        id: 1,
        organizationId: 1,
        name: 'Geekway to the Testing Again',
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
        tteConventionId: 'fake id',
      };

      mockCtx.prisma.convention.update.mockResolvedValue(convention);

      const updatedConvention = await controller.updateConvention(1, {
        name: 'Geekway to the Testing Again',
      });

      expect(updatedConvention.name).toBe('Geekway to the Testing Again');
    });
  });

  describe('importAttendees', () => {
    it('should import attendees', async () => {
      const convention = {
        id: 1,
        organizationId: 1,
        name: 'Geekway to the Testing Again',
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
        tteConventionId: 'fake id',
      };

      mockCtx.prisma.convention.findUnique.mockResolvedValue(convention);

      const attendeeCount = await controller.importAttendees(1, {
        apiKey: 'fake api key',
        userName: 'fake username',
        password: 'fake password',
      });

      expect(attendeeCount).toBe(1);
    });
  });
});
