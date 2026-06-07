import { Test, TestingModule } from '@nestjs/testing';
import { ConventionController } from './convention.controller';
import {
  Context,
  MockContext,
  createMockContext,
} from '../../services/prisma/context';
import { BadGatewayException, ExecutionContext } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import fastify = require('fastify');
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
        playAndWinAnnounced: false,
        doorPrizesAnnounced: false,
        playAndWinCollectionId: 1,
        doorPrizeCollectionId: 1,
        playAndWinWinnersAnnounced: false,
        playAndWinWinnersSelected: false,
        tteConventionId: '',
      };

      mockCtx.prisma.convention.create.mockResolvedValueOnce(convention);

      const createConvention = await controller.createConvention({
        name: 'Geekway to the Testing',
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
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
      mockCtx.prisma.convention.create.mockImplementationOnce(() => {
        throw new BadGatewayException();
      });

      expect(
        controller.createConvention({
          name: 'Geekway to the Testing',
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
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

  describe('syncTabletopEventsAttendees', () => {
    it('should import attendees', async () => {
      const convention = {
        id: 1,
        organizationId: 1,
        name: 'Geekway to the Testing Again',
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

      const startSpy = jest
        .spyOn(controller['conventionService'], 'startSyncTabletopEventsAttendees')
        .mockReturnValue({ status: 'started', message: 'go' });

      const userData = {
        apiKey: 'fake api key',
        userName: 'fake username',
        password: 'fake password',
      };

      // Launches in the background and returns "started" immediately rather
      // than holding the request open until the import finishes.
      const result = await controller.syncTabletopEventsAttendees(1, userData);

      expect(result.status).toBe('started');
      expect(startSpy).toHaveBeenCalledWith(userData, 1, controller['ctx']);
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
        eligibleForPrizes: true,
        lostBadge: false,
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
        eligibleForPrizes: true,
        lostBadge: false,
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

      expect(controller.exportBadgeFile(1)).resolves.toBeTruthy();
    });
  });

  describe('getConventions', () => {
    it('should return the conventions visible to the user', async () => {
      mockCtx.prisma.convention.findMany.mockResolvedValue([{ id: 1 }] as any);

      const cons = await controller.getConventions({ id: 1 });

      expect(cons.length).toBe(1);
    });
  });

  describe('importAttendeesCSV', () => {
    it('should reject when the file is missing', async () => {
      const execCtx = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            file: () => null,
          }),
        }),
      });

      const req = execCtx
        .switchToHttp()
        .getRequest() as fastify.FastifyRequest;

      await expect(controller.importAttendeesCSV(req, 1)).rejects.toBe(
        'missing file',
      );
    });

    it('should import attendees from the uploaded csv', async () => {
      const execCtx = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            file: () => ({
              toBuffer: () => Buffer.from('Ada,Lovelace,101\n'),
            }),
          }),
        }),
      });

      const req = execCtx
        .switchToHttp()
        .getRequest() as fastify.FastifyRequest;

      const startSpy = jest
        .spyOn(controller['conventionService'], 'startImportAttendeesCSV')
        .mockReturnValue({ status: 'started', message: 'go' });

      // The controller still reads the upload into a buffer synchronously,
      // then hands it to the background launcher and returns "started".
      const result = await controller.importAttendeesCSV(req, 1);

      expect(result.status).toBe('started');
      expect(startSpy).toHaveBeenCalledWith(
        Buffer.from('Ada,Lovelace,101\n'),
        1,
        controller['ctx'],
      );
    });
  });

  describe('attachCollection', () => {
    it('should attach a collection to the convention', async () => {
      mockCtx.prisma.conventionCollections.create.mockResolvedValue({
        conventionId: 1,
        collectionId: 2,
      } as any);

      const result = await controller.attachCollection(1, 2);

      expect(result.collectionId).toBe(2);
    });
  });

  describe('detachCollection', () => {
    it('should detach a collection from the convention', async () => {
      mockCtx.prisma.conventionCollections.delete.mockResolvedValue({
        conventionId: 1,
        collectionId: 2,
      } as any);

      const result = await controller.detachCollection(1, 2);

      expect(result.collectionId).toBe(2);
    });
  });
});
