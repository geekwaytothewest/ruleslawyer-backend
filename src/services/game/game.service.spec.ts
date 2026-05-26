import { Test, TestingModule } from '@nestjs/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { GameService } from './game.service';
import { BoardGameGeekService } from '../boardgamegeek/boardgamegeek.service';
import { Context, MockContext, createMockContext } from '../prisma/context';
import { Prisma } from '@prisma/client';

describe('GameService', () => {
  let service: GameService;
  let mockCtx: MockContext;
  let ctx: Context;
  let bgg: MockProxy<BoardGameGeekService>;

  beforeEach(async () => {
    mockCtx = createMockContext();
    ctx = mockCtx as unknown as Context;
    bgg = mock<BoardGameGeekService>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameService,
        { provide: BoardGameGeekService, useValue: bgg },
      ],
    }).compile();

    service = module.get<GameService>(GameService);
    // Skip the real setTimeout-based pacing in the sync loop.
    (service as any).sleep = jest.fn().mockResolvedValue(undefined);
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
        yearPublished: null,
        organizationId: 1,
      });

      const game = await service.game({ id: 1 }, ctx, { userId: 1 });

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
          yearPublished: null,
          organizationId: 1,
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
            organization: {
              connect: {
                id: 1,
              },
            },
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
          yearPublished: null,
          organizationId: 1,
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

  describe('backfillBggIdsFromRankDump', () => {
    const gameRow = (over: Partial<any>) =>
      ({ id: 1, name: 'Test', yearPublished: null, bggId: null, ...over } as any);

    it('does nothing and skips the dump when no games need a bggId', async () => {
      mockCtx.prisma.game.findMany.mockResolvedValue([]);

      const matched = await service.backfillBggIdsFromRankDump(1, ctx, 'url');

      expect(matched).toBe(0);
      expect(bgg.getRankDumpIndex).not.toHaveBeenCalled();
      expect(mockCtx.prisma.game.update).not.toHaveBeenCalled();
    });

    it('matches a single candidate by normalized name and writes its bggId', async () => {
      mockCtx.prisma.game.findMany.mockResolvedValue([gameRow({ id: 1, name: 'CATAN' })]);
      bgg.getRankDumpIndex.mockResolvedValue(
        new Map([['catan', [{ id: 13, year: 1995, rank: 512 }]]]),
      );

      const matched = await service.backfillBggIdsFromRankDump(1, ctx, 'url');

      expect(matched).toBe(1);
      expect(mockCtx.prisma.game.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { bggId: 13 },
      });
    });

    it('leaves unmatched games alone', async () => {
      mockCtx.prisma.game.findMany.mockResolvedValue([
        gameRow({ id: 1, name: 'Some Obscure Prototype' }),
      ]);
      bgg.getRankDumpIndex.mockResolvedValue(new Map());

      const matched = await service.backfillBggIdsFromRankDump(1, ctx, 'url');

      expect(matched).toBe(0);
      expect(mockCtx.prisma.game.update).not.toHaveBeenCalled();
    });

    it('disambiguates duplicate names by yearPublished', async () => {
      mockCtx.prisma.game.findMany.mockResolvedValue([
        gameRow({ id: 5, name: 'Hive', yearPublished: 2018 }),
      ]);
      bgg.getRankDumpIndex.mockResolvedValue(
        new Map([
          [
            'hive',
            [
              { id: 2655, year: 2001, rank: 300 },
              { id: 999, year: 2018, rank: null },
            ],
          ],
        ]),
      );

      await service.backfillBggIdsFromRankDump(1, ctx, 'url');

      expect(mockCtx.prisma.game.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: { bggId: 999 },
      });
    });

    it('falls back to the most popular (lowest rank) when no year matches', async () => {
      mockCtx.prisma.game.findMany.mockResolvedValue([
        gameRow({ id: 7, name: 'Generic', yearPublished: null }),
      ]);
      bgg.getRankDumpIndex.mockResolvedValue(
        new Map([
          [
            'generic',
            [
              { id: 1, year: 2000, rank: null },
              { id: 2, year: 2001, rank: 300 },
              { id: 3, year: 2002, rank: 100 },
            ],
          ],
        ]),
      );

      await service.backfillBggIdsFromRankDump(1, ctx, 'url');

      expect(mockCtx.prisma.game.update).toHaveBeenCalledWith({
        where: { id: 7 },
        data: { bggId: 3 },
      });
    });
  });

  describe('bggUpdate', () => {
    const gameData = { '@_id': '13', thumbnail: 'http://img/13.jpg' };

    it('downloads the thumbnail and sets coverArt by default', async () => {
      const img = Buffer.from('image-bytes');
      bgg.getImage.mockResolvedValue(img);

      await service.bggUpdate(1, gameData, ctx);

      expect(bgg.getImage).toHaveBeenCalledWith('http://img/13.jpg');
      const data = (mockCtx.prisma.game.update.mock.calls[0][0] as any).data;
      expect(data.coverArt).toBe(img);
      expect(data.bggId).toBe(13);
    });

    it('skips the download and omits coverArt when deferImage is true', async () => {
      await service.bggUpdate(1, gameData, ctx, true);

      expect(bgg.getImage).not.toHaveBeenCalled();
      const data = (mockCtx.prisma.game.update.mock.calls[0][0] as any).data;
      expect(data.coverArt).toBeUndefined();
      expect(data.bggId).toBe(13);
    });
  });

  describe('enrichCoverArt', () => {
    it('fetches each thumbnail and writes coverArt', async () => {
      bgg.getImage.mockResolvedValue(Buffer.from('x'));

      await (service as any).enrichCoverArt(
        [
          { id: 1, thumbnail: 'a' },
          { id: 2, thumbnail: 'b' },
        ],
        ctx,
        5,
      );

      expect(bgg.getImage).toHaveBeenCalledTimes(2);
      expect(mockCtx.prisma.game.update).toHaveBeenCalledTimes(2);
    });

    it('skips the DB write when an image fails to download', async () => {
      bgg.getImage
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(Buffer.from('x'));

      await (service as any).enrichCoverArt(
        [
          { id: 1, thumbnail: 'a' },
          { id: 2, thumbnail: 'b' },
        ],
        ctx,
        5,
      );

      expect(mockCtx.prisma.game.update).toHaveBeenCalledTimes(1);
      expect(mockCtx.prisma.game.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { coverArt: expect.any(Buffer) },
      });
    });
  });
});
