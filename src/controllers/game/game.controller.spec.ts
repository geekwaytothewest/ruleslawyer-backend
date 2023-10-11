import { Test, TestingModule } from '@nestjs/testing';
import { GameController } from './game.controller';
import {
  Context,
  MockContext,
  createMockContext,
} from '../../services/prisma/context';
import { GameService } from '../../services/game/game.service';
import { PrismaService } from '../../services/prisma/prisma.service';
import { Prisma } from '@prisma/client';

describe('GameController', () => {
  let controller: GameController;
  let mockCtx: MockContext;
  let ctx: Context;

  beforeEach(async () => {
    mockCtx = createMockContext();
    ctx = mockCtx as unknown as Context;
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameController],
      providers: [GameService, PrismaService],
    }).compile();

    controller = module.get<GameController>(GameController);
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
      });

      const game = await controller.createGame({
        name: 'Test Game',
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
      });

      const game = await controller.getGame(1);

      expect(game?.id).toBe(1);
    });
  });
});
