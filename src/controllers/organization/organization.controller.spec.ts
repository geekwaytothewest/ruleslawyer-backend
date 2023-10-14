import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationController } from './organization.controller';
import { PrismaService } from '../../services/prisma/prisma.service';
import { OrganizationService } from '../../services/organization/organization.service';
import { ConventionService } from '../../services/convention/convention.service';
import { TabletopeventsService } from '../../services/tabletopevents/tabletopevents.service';
import { AttendeeService } from '../../services/attendee/attendee.service';
import { HttpModule } from 'nestjs-http-promise';
import {
  Context,
  MockContext,
  createMockContext,
} from '../../services/prisma/context';
import { CollectionService } from '../../services/collection/collection.service';
import { CopyService } from '../../services/copy/copy.service';
import { createMock } from '@golevelup/ts-jest';
import fastify = require('fastify');
import { ExecutionContext } from '@nestjs/common';

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
        CollectionService,
        CopyService,
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

  //To do: figure out how to mock a request so i can call controller.importCollection()

  describe('deleteCollection', () => {
    it('should delete a collection', async () => {
      mockCtx.prisma.collection.delete.mockResolvedValue({
        id: 1,
        name: 'Test Collection',
        organizationId: 1,
        public: false,
      });

      expect(await controller.deleteCollection(1, 1)).toBe('deleted');
    });

    it('should error', async () => {
      mockCtx.prisma.convention.count.mockResolvedValue(1);

      expect(await controller.deleteCollection(1, 1)).toBe(
        'cannot delete a collection tied to a convention',
      );
    });
  });

  describe('createCopy', () => {
    it('should create a copy', async () => {
      mockCtx.prisma.copy.create.mockResolvedValue({
        id: 1,
        gameId: 1,
        winnable: false,
        winnerId: null,
        coverArtOverride: null,
        dateAdded: new Date(),
        dateRetired: null,
        barcode: '*00001*',
        barcodeNumber: 1,
        collectionId: 1,
      });

      const copy = await controller.createCopy(1, 1, {
        game: {
          connect: {
            id: 1,
          },
        },
        winnable: false,
        winner: undefined,
        coverArtOverride: null,
        dateAdded: new Date(),
        dateRetired: null,
        barcode: '*00001*',
        barcodeNumber: 1,
      });

      expect(copy?.id).toBe(1);
    });
  });

  describe('importCollection', () => {
    it('should missing file', async () => {
      const ctx = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            file: () => null,
            isMultipart: () => false,
          }),
        }),
      });

      const req = ctx.switchToHttp().getRequest() as fastify.FastifyRequest;

      expect(controller.importCollection(req, 1)).rejects.toBe('missing file');
    });

    it('should missing name', async () => {
      const ctx = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            file: () => ({
              toBuffer: () => 'thisisabuffer',
              fields: ['an', 'array'],
            }),
            isMultipart: () => false,
          }),
        }),
      });

      const req = ctx.switchToHttp().getRequest() as fastify.FastifyRequest;

      expect(controller.importCollection(req, 1)).rejects.toBe('missing name');
    });

    it('should invalid type', async () => {
      const ctx = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            file: () => ({
              toBuffer: () => 'thisisabuffer',
              fields: {
                name: 'Test File',
                type: 'lol',
              },
            }),
            isMultipart: () => false,
          }),
        }),
      });

      const req = ctx.switchToHttp().getRequest() as fastify.FastifyRequest;

      expect(controller.importCollection(req, 1)).rejects.toBe('invalid type');
    });

    it('should missing convention id', async () => {
      const ctx = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            file: () => ({
              toBuffer: () => 'thisisabuffer',
              fields: {
                name: 'Test File',
                type: {
                  value: 'Play and Win',
                },
              },
            }),
            isMultipart: () => false,
          }),
        }),
      });

      const req = ctx.switchToHttp().getRequest() as fastify.FastifyRequest;

      expect(controller.importCollection(req, 1)).rejects.toBe(
        'missing convention id',
      );
    });

    it('should hate invalid csv files', async () => {
      const ctx = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            file: () => ({
              toBuffer: () => Buffer.from(',",'),
              fields: {
                name: 'Test File',
                type: {
                  value: 'Play and Win',
                },
                conventionId: 1,
              },
            }),
            isMultipart: () => false,
          }),
        }),
      });

      const req = ctx.switchToHttp().getRequest() as fastify.FastifyRequest;

      expect(controller.importCollection(req, 1)).rejects.toBe(
        'invalid csv file',
      );
    });

    it('should import a collection', async () => {
      const ctx = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            file: () => ({
              toBuffer: () => 'test,data',
              fields: {
                name: 'Test File',
                type: {
                  value: 'Play and Win',
                },
                conventionId: 1,
              },
            }),
            isMultipart: () => false,
          }),
        }),
      });

      const req = ctx.switchToHttp().getRequest() as fastify.FastifyRequest;

      mockCtx.prisma.copy.create.mockResolvedValue({
        id: 1,
        gameId: 1,
        winnable: true,
        winnerId: null,
        coverArtOverride: null,
        dateAdded: new Date(),
        dateRetired: null,
        barcode: '*00001*',
        barcodeNumber: 1,
        collectionId: 1,
      });

      const importResult = (await controller.importCollection(req, 1)) as any;

      expect(importResult?.importCount).toBe(1);
    });
  });
});
