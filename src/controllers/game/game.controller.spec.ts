import { Test, TestingModule } from '@nestjs/testing';
import { GameController } from './game.controller';
import {
  Context,
  MockContext,
  createMockContext,
} from '../../services/prisma/context';
import { Prisma } from '@prisma/client';
import { GameModule } from '../../modules/game/game.module';
import { GameService } from '../../services/game/game.service';

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
    it('should search games with copies', async () => {
      mockCtx.prisma.game.findMany.mockResolvedValue([{ id: 1 }] as any);

      const games = await controller.getGamesWithCopies({ id: 1 }, '', '', '1');

      expect(games.length).toBe(1);
    });

    it('should apply the limit and filter when provided', async () => {
      mockCtx.prisma.game.findMany.mockResolvedValue([{ id: 1 }] as any);

      await controller.getGamesWithCopies({ id: 1 }, '25', 'catan', '1');

      const args = mockCtx.prisma.game.findMany.mock.calls[0][0] as any;
      expect(args.take).toBe(25);
      expect(args.where.OR).toBeDefined();
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

      const result = await controller.connectBGGGameByName(1, { id: 1 });

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

      await controller.connectBGGGameByName(1, { id: 1 });

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
});
