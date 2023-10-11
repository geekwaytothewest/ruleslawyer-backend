import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service';
import { Context, MockContext, createMockContext } from '../prisma/context';
import { Prisma } from '@prisma/client';

describe('GameService', () => {
  let service: GameService;
  let mockCtx: MockContext;
  let ctx: Context;

  beforeEach(async () => {
    mockCtx = createMockContext();
    ctx = mockCtx as unknown as Context;
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameService],
    }).compile();

    service = module.get<GameService>(GameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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

      const game = await service.game({ id: 1 }, ctx);

      expect(game?.id).toBe(1);
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

        const game = await service.createGame(
          {
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
          },
          ctx,
        );

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
          shortDescription: 'Test Game Short Description',
          weight: new Prisma.Decimal(2.5),
          minAge: 10,
        });

        const game = await service.updateGame(
          {
            where: { id: 1 },
            data: {
              shortDescription: 'Test Game Short Description',
            },
          },
          ctx,
        );

        expect(game?.id).toBe(1);
      });
    });
  });
});
