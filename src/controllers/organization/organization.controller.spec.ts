import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { OrganizationController } from './organization.controller';
import { CreateCollectionDto } from '../collection/dto/create-collection.dto';
import {
  Context,
  MockContext,
  createMockContext,
} from '../../services/prisma/context';
import { createMock } from '@golevelup/ts-jest';
import fastify = require('fastify');
import { ExecutionContext } from '@nestjs/common';
import { OrganizationModule } from '../../modules/organization/organization.module';

describe('OrganizationController', () => {
  let controller: OrganizationController;
  let mockCtx: MockContext;
  let ctx: Context;

  beforeEach(async () => {
    mockCtx = createMockContext();
    ctx = mockCtx as unknown as Context;
    const module: TestingModule = await Test.createTestingModule({
      imports: [OrganizationModule],
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
        enableBggSupport: false,
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

      const organization = {
        id: 1,
        name: 'Geekeway to the Testing',
        ownerId: 1,
        enableBggSupport: false,
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
          type: {
            connect: {
              id: 1,
            },
          },
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
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
        allowWinning: false,
        archived: false,
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
      mockCtx.prisma.copy.upsert.mockResolvedValue({
        id: 1,
        gameId: 1,
        winnable: false,
        winnerId: null,
        coverArtOverride: null,
        dateAdded: new Date(),
        dateRetired: null,
        barcode: '*00001*',
        barcodeLabel: '1',
        collectionId: 1,
        organizationId: 1,
        comments: null,
      });

      const copy = await controller.createCopy(1, 1, {
        game: {
          connect: {
            id: 1,
          },
        },
        winnable: false,
        barcode: '*00001*',
        barcodeLabel: '1',
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

      mockCtx.prisma.collection.create.mockResolvedValue({
        id: 1,
        name: 'test collection',
        organizationId: 1,
        public: false,
        allowWinning: false,
        archived: false,
      });

      mockCtx.prisma.collection.findUnique.mockResolvedValue({
        id: 1,
        name: 'test collection',
        organizationId: 1,
        public: false,
        allowWinning: false,
        archived: false,
      });

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

      mockCtx.prisma.copy.upsert.mockResolvedValue({
        id: 1,
        gameId: 1,
        winnable: true,
        comments: null,
        winnerId: null,
        coverArtOverride: null,
        dateAdded: new Date(),
        dateRetired: null,
        barcode: '*00001*',
        barcodeLabel: '1',
        collectionId: 1,
        organizationId: 1,
      });

      mockCtx.prisma.collection.create.mockResolvedValueOnce({
        id: 1,
        name: 'Test Collection',
        organizationId: 1,
        public: false,
        allowWinning: false,
        archived: false,
      });

      mockCtx.prisma.collection.findUnique.mockResolvedValue({
        id: 1,
        name: 'Test Collection',
        organizationId: 1,
        public: false,
        allowWinning: false,
        archived: false,
      });

      const importResult = (await controller.importCollection(req, 1)) as any;

      expect(importResult?.importCount).toBe(1);
    });
  });

  describe('checkOutCopy', () => {
    it('should call check out copy', async () => {
      mockCtx.prisma.copy.findUnique.mockResolvedValue(null);

      expect(
        controller.checkOutCopy(1, 1, 1, '*000001*', '1', { userId: 1 }),
      ).rejects.toBe('copy not found');
    });
  });

  describe('checkInCopy', () => {
    it('should call check in copy', async () => {
      mockCtx.prisma.copy.findUnique.mockResolvedValue(null);

      expect(controller.checkInCopy(1, 1, 1, '*000001*')).rejects.toBe(
        'copy not found',
      );
    });
  });

  describe('createConventionType', () => {
    it('should create a convention type', async () => {
      mockCtx.prisma.conventionType.create.mockResolvedValue({
        id: 1,
        organizationId: 1,
        name: 'Geekway to the West',
        description: null,
        logo: null,
        logoSquare: null,
        icon: null,
        content: null,
      });

      expect(
        controller.createConventionType(1, {
          name: 'Geekway to the West',
        }),
      ).resolves.toBeTruthy();
    });
  });

  describe('submitPrizeEntry', () => {
    it('should call submit', async () => {
      mockCtx.prisma.checkOut.findUnique.mockResolvedValue(null);

      expect(controller.submitPrizeEntry(1, 1, 1, 1, [])).rejects.toBe(
        'not checked in',
      );
    });
  });

  describe('organization', () => {
    it('should return an organization', async () => {
      mockCtx.prisma.organization.findUnique.mockResolvedValue({
        id: 1,
        name: 'Geekway',
        ownerId: 1,
        enableBggSupport: false,
      });

      const org = await controller.organization(1);

      expect(org?.id).toBe(1);
    });
  });

  describe('getConventionTypes', () => {
    it('should return the convention types for an org', async () => {
      mockCtx.prisma.conventionType.findMany.mockResolvedValue([
        { id: 1 },
      ] as any);

      const types = (await controller.getConventionTypes(1)) as any[];

      expect(types.length).toBe(1);
    });
  });

  describe('getConventions', () => {
    it('should return the conventions for an org', async () => {
      mockCtx.prisma.convention.findMany.mockResolvedValue([{ id: 1 }] as any);

      const cons = (await controller.getConventions(1)) as any[];

      expect(cons.length).toBe(1);
    });
  });

  describe('getCollections', () => {
    it('should return the collections for an org', async () => {
      mockCtx.prisma.collection.findMany.mockResolvedValue([{ id: 1 }] as any);

      const cols = (await controller.getCollections(1)) as any[];

      expect(cols.length).toBe(1);
    });
  });

  describe('getGames', () => {
    it('should return the games for an org', async () => {
      mockCtx.prisma.game.findMany.mockResolvedValue([{ id: 1 }] as any);

      const games = await controller.getGames(1);

      expect(games.length).toBe(1);
    });
  });

  describe('getGamesWithCopies', () => {
    it('should return the games with copies for an org', async () => {
      mockCtx.prisma.game.findMany.mockResolvedValue([{ id: 1 }] as any);

      const games = await controller.getGamesWithCopies(1, { id: 1 });

      expect(games.length).toBe(1);
    });
  });

  describe('searchGames', () => {
    it('should search games by name', async () => {
      mockCtx.prisma.game.findMany.mockResolvedValue([{ id: 1 }] as any);

      const games = await controller.searchGames('catan');

      expect(games.length).toBe(1);
    });
  });

  describe('autocompleteGames', () => {
    it('should autocomplete games by name', async () => {
      mockCtx.prisma.game.findMany.mockResolvedValue([{ id: 1 }] as any);

      const games = await controller.autocompleteGames('cat');

      expect(games.length).toBe(1);
      const args = mockCtx.prisma.game.findMany.mock.calls[0][0] as any;
      expect(args.take).toBe(10);
    });
  });

  describe('CreateCollectionDto validation', () => {
    it('fails validation when name is not set', async () => {
      const dto = plainToInstance(CreateCollectionDto, { allowWinning: true });

      const errors = await validate(dto);

      expect(errors.map((e) => e.property)).toContain('name');
    });

    it('fails validation when allowWinning is not a boolean', async () => {
      const dto = plainToInstance(CreateCollectionDto, { name: 'New' });

      const errors = await validate(dto);

      expect(errors.map((e) => e.property)).toContain('allowWinning');
    });
  });

  describe('createCollection', () => {
    it('should create a collection when the body is valid', async () => {
      mockCtx.prisma.collection.create.mockResolvedValue({
        id: 1,
        name: 'New',
        organizationId: 1,
        public: false,
        allowWinning: true,
        archived: false,
      });

      const result = (await controller.createCollection(1, {
        name: 'New',
        allowWinning: true,
      } as any)) as any;

      expect(result?.id).toBe(1);
    });
  });
});
