import { Test, TestingModule } from '@nestjs/testing';
import { ConventionController } from './convention.controller';
import {
  Context,
  MockContext,
  createMockContext,
} from '../../services/prisma/context';
import { BadGatewayException } from '@nestjs/common';
import { ConventionModule } from '../../modules/convention/convention.module';

describe('ConventionController', () => {
  let controller: ConventionController;
  let mockCtx: MockContext;
  let ctx: Context;

  beforeEach(async () => {
    mockCtx = createMockContext();
    ctx = mockCtx as unknown as Context;
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConventionModule],
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
        startDate: new Date(),
        endDate: new Date(),
        type: {
          connect: {
            id: 1,
          },
        },
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
          startDate: new Date(),
          endDate: new Date(),
          type: {
            connect: {
              id: 1,
            },
          },
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

  describe('createAttendee', () => {
    it('should create an attendee', async () => {
      mockCtx.prisma.attendee.create.mockResolvedValue({
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
      });

      const attendee = await controller.createAttendee(1, {
        badgeName: 'asdf',
        badgeFirstName: 'asdf',
        badgeLastName: 'asdf',
        legalName: 'asdf',
        badgeNumber: '1',
        barcode: '*000001*',
        convention: {
          connect: { id: 1 },
        },
        user: undefined,
        tteBadgeNumber: 1,
        email: 'test@geekway.com',
      });

      expect(attendee?.id).toBe(1);
    });

    it('should reject a mismatched convention id', async () => {
      mockCtx.prisma.attendee.create.mockResolvedValue({
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
      });

      expect(
        controller.createAttendee(1, {
          badgeName: 'asdf',
          badgeFirstName: 'asdf',
          badgeLastName: 'asdf',
          legalName: 'asdf',
          badgeNumber: '1',
          barcode: '*000001*',
          convention: {
            connect: { id: 2 },
          },
          user: undefined,
          tteBadgeNumber: 1,
          email: 'test@geekway.com',
        }),
      ).rejects.toBe('convention id mismatch');
    });
  });

  describe('exportBadgeFile', () => {
    it('should export a csv', async () => {
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
        },
      ]);

      expect(controller.exportBadgeFile(1)).resolves.toBeTruthy();
    });
  });
});
