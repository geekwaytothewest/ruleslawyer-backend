import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GameController } from './game.controller';
import {
  Context,
  MockContext,
  createMockContext,
} from '../../services/prisma/context';
import { Prisma } from '@prisma/client';
import { GameModule } from '../../modules/game/game.module';
import { GameService } from '../../services/game/game.service';
import { OrganizationBggGuard } from '../../guards/organization/organization-bgg.guard';

describe('GameController', () => {
  let controller: GameController;
  let gameService: GameService;
  let mockCtx: MockContext;
  let ctx: Context;

  beforeEach(async () => {
    mockCtx = createMockContext();
    ctx = mockCtx as unknown as Context;
    const module: TestingModule = await Test.createTestingModule({
      imports: [GameModule],
    }).compile();

    controller = module.get<GameController>(GameController);
    gameService = module.get<GameService>(GameService);
    controller.ctx = ctx;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createGame', () => {
    it('should create a game', async () => {
      mockCtx.prisma.game.create.mockResolvedValue({
        id: 1,
        name: 'Test Game',
        minPlayers: 1,
        maxPlayers: 99,
        bggId: null,
        bggVersionId: null,
        bggRank: null,
        bggRating: null,
        artist: 'Test Artist',
        coverArt: Buffer.from(''),
        designer: 'Test Designer',
        lastBGGSync: null,
        longDescription: 'Test Game Long Description',
        maxTime: 90,
        minTime: 60,
        publisher: 'Test Publisher',
        shortDescription: 'Test Game Short Description',
        weight: new Prisma.Decimal(2.5),
        minAge: 10,
        yearPublished: null,
        organizationId: 1,
      });

      const game = await controller.createGame({
        name: 'Test Game',
        organization: {
          connect: {
            id: 1,
          },
        },
      });

      expect(game?.id).toBe(1);
    });
  });

  describe('updateGame', () => {
    it('should update a game', async () => {
      mockCtx.prisma.game.update.mockResolvedValue({
        id: 1,
        name: 'Test Game',
        minPlayers: 1,
        maxPlayers: 99,
        bggId: null,
        bggVersionId: null,
        bggRank: null,
        bggRating: null,
        artist: 'Test Artist',
        coverArt: Buffer.from(''),
        designer: 'Test Designer',
        lastBGGSync: null,
        longDescription: 'Test Game Long Description',
        maxTime: 90,
        minTime: 60,
        publisher: 'Test Publisher',
        shortDescription: 'Updated Short Description',
        weight: new Prisma.Decimal(2.5),
        minAge: 10,
        yearPublished: null,
        organizationId: 1,
      });

      const game = await controller.updateGame(
        {
          shortDescription: 'Updated Short Description',
        },
        1,
      );

      expect(game?.shortDescription).toBe('Updated Short Description');
    });
  });

  describe('game', () => {
    it('should return a game', async () => {
      mockCtx.prisma.game.findUnique.mockResolvedValue({
        id: 1,
        name: 'Test Game',
        minPlayers: 1,
        maxPlayers: 99,
        bggId: null,
        bggVersionId: null,
        bggRank: null,
        bggRating: null,
        artist: 'Test Artist',
        coverArt: Buffer.from(''),
        designer: 'Test Designer',
        lastBGGSync: null,
        longDescription: 'Test Game Long Description',
        maxTime: 90,
        minTime: 60,
        publisher: 'Test Publisher',
        shortDescription: 'Test Game Short Description',
        weight: new Prisma.Decimal(2.5),
        minAge: 10,
        yearPublished: null,
        organizationId: 1,
      });

      const game = await controller.getGame(1, { userId: 1 });

      expect(game?.id).toBe(1);
    });
  });

  describe('getGames', () => {
    it('should search games for the user', async () => {
      mockCtx.prisma.game.findMany.mockResolvedValue([{ id: 1 }] as any);

      const games = await controller.getGames({ id: 1 }, '1');

      expect(games.length).toBe(1);
    });
  });

  describe('getGamesWithCopies', () => {
    it('should search games with copies and return pagination metadata', async () => {
      mockCtx.prisma.$transaction.mockResolvedValue([[{ id: 1 }], 1] as any);

      const result = await controller.getGamesWithCopies(
        { id: 1 },
        '',
        '',
        '1',
        '',
      );

      expect(result.data.length).toBe(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.hasMore).toBe(false);
    });

    it('should apply the limit and filter when provided', async () => {
      mockCtx.prisma.$transaction.mockResolvedValue([[{ id: 1 }], 1] as any);

      await controller.getGamesWithCopies({ id: 1 }, '25', 'catan', '1', '');

      const args = mockCtx.prisma.game.findMany.mock.calls[0][0] as any;
      expect(args.take).toBe(25);
      expect(args.skip).toBe(0);
      // The name filter is ANDed onto the permission/org scoping rather than
      // replacing it, so both the scoping and the name OR are present.
      expect(args.where.AND).toHaveLength(2);
      expect(args.where.AND[0].OR).toBeDefined();
      expect(args.where.AND[1].OR).toBeDefined();
    });

    it('should compute skip from the page number and report hasMore', async () => {
      mockCtx.prisma.$transaction.mockResolvedValue([[{ id: 1 }], 60] as any);

      const result = await controller.getGamesWithCopies(
        { id: 1 },
        '25',
        '',
        '1',
        '2',
      );

      const args = mockCtx.prisma.game.findMany.mock.calls[0][0] as any;
      expect(args.take).toBe(25);
      expect(args.skip).toBe(25);
      expect(result.page).toBe(2);
      expect(result.totalPages).toBe(3);
      expect(result.hasMore).toBe(true);
    });

    it('should cap the page size for non-numeric limits like "All"', async () => {
      mockCtx.prisma.$transaction.mockResolvedValue([[{ id: 1 }], 1] as any);

      const result = await controller.getGamesWithCopies(
        { id: 1 },
        'All',
        '',
        '1',
        '',
      );

      const args = mockCtx.prisma.game.findMany.mock.calls[0][0] as any;
      expect(args.take).toBe(1000);
      expect(result.pageSize).toBe(1000);
    });
  });

  describe('getCopyCount', () => {
    it('should return the copy count for the game', async () => {
      const spy = jest
        .spyOn(gameService, 'gameCopyCount')
        .mockResolvedValue(7);

      const result = await controller.getCopyCount(1);

      expect(result).toBe(7);
      expect(spy).toHaveBeenCalledWith(ctx, 1);
    });
  });

  describe('deleteGame', () => {
    it('should delete a game', async () => {
      mockCtx.prisma.game.delete.mockResolvedValue({ id: 1 } as any);

      const result = await controller.deleteGame(1);

      expect(result.id).toBe(1);
    });
  });

  describe('getCopies', () => {
    it('should search copies for a game', async () => {
      mockCtx.prisma.copy.findMany.mockResolvedValue([{ id: 1 }] as any);

      const copies = await controller.getCopies(1, '1', { id: 1 });

      expect(copies.length).toBe(1);
    });
  });

  describe('connectBGGGameByName', () => {
    it('should return null when the game is not found', async () => {
      mockCtx.prisma.game.findUnique.mockResolvedValue(null);
      const spy = jest.spyOn(gameService, 'connectBGGGameByName');

      const result = await controller.connectBGGGameByName(1, 1, { id: 1 });

      expect(result).toBeNull();
      expect(spy).not.toHaveBeenCalled();
    });

    it('should connect the game by name when found', async () => {
      mockCtx.prisma.game.findUnique.mockResolvedValue({
        id: 1,
        name: 'Catan',
      } as any);
      const spy = jest
        .spyOn(gameService, 'connectBGGGameByName')
        .mockResolvedValue({ id: 1 } as any);

      await controller.connectBGGGameByName(1, 1, { id: 1 });

      expect(spy).toHaveBeenCalledWith(1, 'Catan', ctx);
    });
  });

  describe('syncAndConnectGamesWithBGG', () => {
    it('should delegate to the service', async () => {
      const spy = jest
        .spyOn(gameService, 'syncAndConnectGamesWithBGG')
        .mockResolvedValue(undefined as any);

      await controller.syncAndConnectGamesWithBGG(1, 'http://dump');

      expect(spy).toHaveBeenCalledWith(1, ctx, 'http://dump');
    });
  });

  describe('syncBGGGame', () => {
    it('should throw NotFoundException when the game is not found', async () => {
      mockCtx.prisma.game.findUnique.mockResolvedValue(null);
      const spy = jest.spyOn(gameService, 'syncBGGGame');

      await expect(controller.syncBGGGame(1, 1, { id: 1 })).rejects.toThrow(
        NotFoundException,
      );
      expect(spy).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when the game has no bggId', async () => {
      mockCtx.prisma.game.findUnique.mockResolvedValue({
        id: 1,
        name: 'Catan',
        bggId: null,
      } as any);
      const spy = jest.spyOn(gameService, 'syncBGGGame');

      await expect(controller.syncBGGGame(1, 1, { id: 1 })).rejects.toThrow(
        BadRequestException,
      );
      expect(spy).not.toHaveBeenCalled();
    });

    it('should sync the game when found with a bggId', async () => {
      mockCtx.prisma.game.findUnique.mockResolvedValue({
        id: 1,
        name: 'Catan',
        bggId: 13,
      } as any);
      const spy = jest
        .spyOn(gameService, 'syncBGGGame')
        .mockResolvedValue({ id: 1 } as any);

      await controller.syncBGGGame(1, 1, { id: 1 });

      expect(spy).toHaveBeenCalledWith(1, ctx);
    });
  });

  describe('getCover', () => {
    it('streams the cover image with a sniffed content type', async () => {
      const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
      jest.spyOn(gameService, 'getCoverArt').mockResolvedValue(jpeg);

      const file = await controller.getCover(1);

      expect(gameService.getCoverArt).toHaveBeenCalledWith(1, ctx);
      expect(file.getStream().read()).toEqual(jpeg);
      expect(file.options.type).toBe('image/jpeg');
    });

    it('404s when the game has no cover art', async () => {
      jest.spyOn(gameService, 'getCoverArt').mockResolvedValue(null);

      await expect(controller.getCover(1)).rejects.toThrow(
        'No cover art set for game 1.',
      );
    });
  });

  // Unit tests invoke handlers directly, which bypasses guards entirely, so
  // assert at the metadata level that the BGG gate is wired onto every
  // BGG-related route. This fails the moment OrganizationBggGuard is dropped
  // from a @UseGuards line, which would silently expose the endpoint.
  describe('BGG gate wiring', () => {
    const reflector = new Reflector();

    it.each([
      'connectBGGGameByName',
      'syncAndConnectGamesWithBGG',
      'syncBGGGame',
    ] as const)('gates %s with OrganizationBggGuard', (method) => {
      const guards =
        reflector.get('__guards__', GameController.prototype[method]) ?? [];

      expect(guards).toContain(OrganizationBggGuard);
    });
  });
});
