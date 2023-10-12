import { Test, TestingModule } from '@nestjs/testing';
import { ConventionController } from './convention.controller';
import { ConventionService } from '../../services/convention/convention.service';
import { OrganizationService } from '../../services/organization/organization.service';
import { AttendeeService } from '../../services/attendee/attendee.service';
import { TabletopeventsService } from '../../services/tabletopevents/tabletopevents.service';
import { PrismaService } from '../../services/prisma/prisma.service';
import { HttpModule } from 'nestjs-http-promise';
import {
  Context,
  MockContext,
  createMockContext,
} from '../../services/prisma/context';
import { BadGatewayException } from '@nestjs/common';

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
        TabletopeventsService,
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

      mockCtx.prisma.organization.findUnique.mockResolvedValueOnce(
        organization,
      );

      mockCtx.prisma.convention.create.mockResolvedValueOnce(convention);

      const createConvention = await controller.createConvention({
        name: 'Geekway to the Testing',
        organization: {
          connect: {
            id: 1,
          },
        },
      });

      expect(createConvention?.name).toBe('Geekway to the Testing');
    });

    it('should throw an error', async () => {
      mockCtx.prisma.organization.findUnique.mockImplementationOnce(() => {
        throw new BadGatewayException();
      });

      expect(
        controller.createConvention({
          name: 'Geekway to the Testing',
          organization: {
            connect: {
              id: 1,
            },
          },
        }),
      ).rejects.toThrow();
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

      mockCtx.prisma.convention.findUnique.mockResolvedValueOnce(convention);

      const getConvention = await controller.getConvention(1);

      expect(getConvention?.id).toBe(1);
    });

    it('should error', () => {
      mockCtx.prisma.convention.findUnique.mockImplementationOnce(() => {
        throw new BadGatewayException();
      });

      expect(controller.getConvention(1)).rejects.toThrow();
    });

    it('should error not found', () => {
      mockCtx.prisma.convention.findUnique.mockResolvedValueOnce(null);

      expect(controller.getConvention(1)).rejects.toThrow();
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

      mockCtx.prisma.convention.update.mockResolvedValueOnce(convention);

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

      mockCtx.prisma.attendee.deleteMany.mockResolvedValueOnce({
        count: 10,
      });

      mockCtx.prisma.convention.findUnique.mockResolvedValueOnce(convention);

      jest
        .spyOn(controller['conventionService'], 'importAttendees')
        .mockResolvedValueOnce(1);

      const attendeeCount = await controller.importAttendees(1, {
        apiKey: 'fake api key',
        userName: 'fake username',
        password: 'fake password',
      });

      expect(attendeeCount).toBe(1);
    });
  });
});
