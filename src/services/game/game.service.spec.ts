import { ConflictException } from '@nestjs/common';
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
        bggRank: null,
        bggRating: null,
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
          bggRank: null,
          bggRating: null,
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
          bggRank: null,
          bggRating: null,
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
        new Map([['catan', [{ id: 13, year: 1995, rank: 512, rating: 7.2 }]]]),
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
              { id: 2655, year: 2001, rank: 300, rating: 7.1 },
              { id: 999, year: 2018, rank: null, rating: 8.3 },
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
              { id: 1, year: 2000, rank: null, rating: 6.5 },
              { id: 2, year: 2001, rank: 300, rating: 7.0 },
              { id: 3, year: 2002, rank: 100, rating: 8.1 },
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

  describe('drainCoverArtQueue', () => {
    it('fetches each queued thumbnail and writes coverArt', async () => {
      bgg.getImage.mockResolvedValue(Buffer.from('x'));

      const queue = [
        { id: 1, thumbnail: 'a' },
        { id: 2, thumbnail: 'b' },
      ];

      await (service as any).drainCoverArtQueue(queue, () => true, ctx);

      expect(bgg.getImage).toHaveBeenCalledTimes(2);
      expect(mockCtx.prisma.game.update).toHaveBeenCalledTimes(2);
      expect(queue).toHaveLength(0);
    });

    it('skips the DB write when an image fails to download', async () => {
      bgg.getImage
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(Buffer.from('x'));

      const queue = [
        { id: 1, thumbnail: 'a' },
        { id: 2, thumbnail: 'b' },
      ];

      await (service as any).drainCoverArtQueue(queue, () => true, ctx);

      expect(mockCtx.prisma.game.update).toHaveBeenCalledTimes(1);
      expect(mockCtx.prisma.game.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { coverArt: expect.any(Buffer) },
      });
    });

    it('exits immediately when the producer is done and the queue is empty', async () => {
      await (service as any).drainCoverArtQueue([], () => true, ctx);

      expect(bgg.getImage).not.toHaveBeenCalled();
      expect(mockCtx.prisma.game.update).not.toHaveBeenCalled();
    });

    it('drains jobs the producer appends after the worker starts', async () => {
      bgg.getImage.mockResolvedValue(Buffer.from('x'));

      const queue: { id: number; thumbnail: string }[] = [];
      let done = false;
      const worker = (service as any).drainCoverArtQueue(queue, () => done, ctx);

      // Producer appends a job after the worker is already polling, then signals
      // completion — the worker must pick it up before exiting.
      queue.push({ id: 7, thumbnail: 'late' });
      done = true;

      await worker;

      expect(bgg.getImage).toHaveBeenCalledWith('late');
      expect(mockCtx.prisma.game.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('games', () => {
    it('returns the games for an org ordered by name', async () => {
      mockCtx.prisma.game.findMany.mockResolvedValue([{ id: 1 }] as any);

      const games = await service.games(1, ctx);

      expect(games.length).toBe(1);
      expect(mockCtx.prisma.game.findMany).toHaveBeenCalledWith({
        where: { organizationId: 1 },
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('search', () => {
    it('passes the query straight through to findMany', async () => {
      mockCtx.prisma.game.findMany.mockResolvedValue([{ id: 1 }] as any);

      const where = { where: { name: { contains: 'cat' } } };
      const result = await service.search(where, ctx);

      expect(result.length).toBe(1);
      expect(mockCtx.prisma.game.findMany).toHaveBeenCalledWith(where);
    });
  });

  describe('searchWithCount', () => {
    it('returns the page data alongside the total matching count', async () => {
      mockCtx.prisma.$transaction.mockResolvedValue([[{ id: 1 }], 42] as any);

      const query = { where: { name: { contains: 'cat' } }, take: 25, skip: 0 };
      const result = await service.searchWithCount(query, ctx);

      expect(result).toEqual({ data: [{ id: 1 }], total: 42 });
      expect(mockCtx.prisma.game.findMany).toHaveBeenCalledWith(query);
      expect(mockCtx.prisma.game.count).toHaveBeenCalledWith({
        where: query.where,
      });
    });
  });

  describe('deleteGame', () => {
    it('deletes by numeric id', async () => {
      mockCtx.prisma.game.delete.mockResolvedValue({ id: 1 } as any);

      const result = await service.deleteGame(1, ctx);

      expect(result.id).toBe(1);
      expect(mockCtx.prisma.game.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('bggUpdate link parsing', () => {
    it('joins publisher/designer/artist links and parses numeric fields', async () => {
      const gameData = {
        '@_id': '42',
        thumbnail: 'http://img/42.jpg',
        minplayers: { '@_value': '2' },
        maxplayers: { '@_value': '4' },
        minplaytime: { '@_value': '30' },
        maxplaytime: { '@_value': '60' },
        minage: { '@_value': '8' },
        description: 'A great game',
        statistics: {
          ratings: {
            averageweight: { '@_value': '2.5' },
            average: { '@_value': '7.83456' },
            ranks: {
              rank: [
                { '@_name': 'boardgame', '@_value': '5' },
                { '@_name': 'strategygames', '@_value': '3' },
              ],
            },
          },
        },
        link: [
          { '@_type': 'boardgamepublisher', '@_value': 'Pub A' },
          { '@_type': 'boardgamepublisher', '@_value': 'Pub B' },
          { '@_type': 'boardgamedesigner', '@_value': 'Designer A' },
          { '@_type': 'boardgameartist', '@_value': 'Artist A' },
        ],
      };
      bgg.getImage.mockResolvedValue(Buffer.from('img'));

      await service.bggUpdate(1, gameData, ctx);

      const data = (mockCtx.prisma.game.update.mock.calls[0][0] as any).data;
      expect(data.bggId).toBe(42);
      expect(data.minPlayers).toBe(2);
      expect(data.maxPlayers).toBe(4);
      expect(data.minTime).toBe(30);
      expect(data.maxTime).toBe(60);
      expect(data.minAge).toBe(8);
      expect(data.weight).toBe(2.5);
      expect(data.publisher).toBe('Pub A, Pub B');
      expect(data.designer).toBe('Designer A');
      expect(data.artist).toBe('Artist A');
      // bggRank: the 'boardgame' entry's @_value; bggRating: the raw average.
      expect(data.bggRank).toBe(5);
      expect(data.bggRating).toBeCloseTo(7.83456);
    });
  });

  describe('bggUpdate rank/rating extraction', () => {
    const dataFrom = () =>
      (mockCtx.prisma.game.update.mock.calls[0][0] as any).data;

    const withRanks = (rank: any, average?: { '@_value': string }) => ({
      '@_id': '1',
      statistics: { ratings: { ...(average ? { average } : {}), ranks: { rank } } },
    });

    beforeEach(() => bgg.getImage.mockResolvedValue(Buffer.from('img')));

    it('pulls the boardgame rank out of a ranks array', async () => {
      await service.bggUpdate(1, withRanks([
        { '@_name': 'strategygames', '@_value': '3' },
        { '@_name': 'boardgame', '@_value': '42' },
      ]), ctx);

      expect(dataFrom().bggRank).toBe(42);
    });

    it('handles a single rank object (not wrapped in an array)', async () => {
      await service.bggUpdate(
        1,
        withRanks({ '@_name': 'boardgame', '@_value': '7' }),
        ctx,
      );

      expect(dataFrom().bggRank).toBe(7);
    });

    it('treats "Not Ranked" as undefined', async () => {
      await service.bggUpdate(
        1,
        withRanks({ '@_name': 'boardgame', '@_value': 'Not Ranked' }),
        ctx,
      );

      expect(dataFrom().bggRank).toBeUndefined();
    });

    it('leaves bggRank undefined when there is no boardgame rank entry', async () => {
      await service.bggUpdate(
        1,
        withRanks({ '@_name': 'strategygames', '@_value': '3' }),
        ctx,
      );

      expect(dataFrom().bggRank).toBeUndefined();
    });

    it('parses bggRating from statistics.ratings.average', async () => {
      await service.bggUpdate(
        1,
        withRanks({ '@_name': 'boardgame', '@_value': '5' }, { '@_value': '8.21' }),
        ctx,
      );

      expect(dataFrom().bggRating).toBeCloseTo(8.21);
    });

    it('leaves both undefined when statistics are absent', async () => {
      await service.bggUpdate(1, { '@_id': '42' }, ctx);

      const data = dataFrom();
      expect(data.bggRank).toBeUndefined();
      expect(data.bggRating).toBeUndefined();
    });
  });

  describe('connectBGGGameByName', () => {
    it('returns null when no board game matches the name', async () => {
      bgg.getBoardGameIdByName.mockResolvedValue(null as any);

      const result = await service.connectBGGGameByName(1, 'Nope', ctx);

      expect(result).toBeNull();
      expect(mockCtx.prisma.game.update).not.toHaveBeenCalled();
    });

    it('updates the game when a match is found', async () => {
      bgg.getBoardGameIdByName.mockResolvedValue(13 as any);
      bgg.getBoardGameByBGGId.mockResolvedValue({ '@_id': '13' } as any);
      bgg.getImage.mockResolvedValue(null as any);
      mockCtx.prisma.game.update.mockResolvedValue({ id: 1 } as any);

      await service.connectBGGGameByName(1, 'Catan', ctx);

      expect(bgg.getBoardGameByBGGId).toHaveBeenCalledWith(13);
      expect(mockCtx.prisma.game.update).toHaveBeenCalled();
    });
  });

  describe('syncBGGGame', () => {
    it('skips when the game has no bggId', async () => {
      mockCtx.prisma.game.findUnique.mockResolvedValue({
        id: 1,
        bggId: null,
      } as any);

      const result = await service.syncBGGGame(1, ctx);

      expect(result).toBeNull();
      expect(bgg.getBoardGameByBGGId).not.toHaveBeenCalled();
    });

    it('updates the game from BGG when a bggId is present', async () => {
      mockCtx.prisma.game.findUnique.mockResolvedValue({
        id: 1,
        bggId: 13,
      } as any);
      bgg.getBoardGameByBGGId.mockResolvedValue({ '@_id': '13' } as any);
      bgg.getImage.mockResolvedValue(null as any);
      mockCtx.prisma.game.update.mockResolvedValue({ id: 1 } as any);

      await service.syncBGGGame(1, ctx);

      expect(bgg.getBoardGameByBGGId).toHaveBeenCalledWith(13);
      expect(mockCtx.prisma.game.update).toHaveBeenCalled();
    });
  });

  describe('gameCopyCount', () => {
    it('returns the copy count for the game', async () => {
      mockCtx.prisma.copy.count.mockResolvedValue(5 as any);

      const result = await service.gameCopyCount(ctx, 1);

      expect(result).toBe(5);
      expect(mockCtx.prisma.copy.count).toHaveBeenCalledWith({
        where: { gameId: 1 },
      });
    });

    it('rejects when the count query fails', async () => {
      mockCtx.prisma.copy.count.mockRejectedValue(new Error('boom'));

      await expect(service.gameCopyCount(ctx, 1)).rejects.toThrow('boom');
    });
  });

  describe('syncAndConnectGamesWithBGG', () => {
    it('syncs games that already have a bggId and enriches their cover art', async () => {
      mockCtx.prisma.game.findMany.mockResolvedValue([
        { id: 1, bggId: 13 },
      ] as any);
      bgg.getBoardGameBatchByBGGIds.mockResolvedValue([
        { '@_id': '13', thumbnail: 'http://img/13.jpg' },
      ] as any);
      bgg.getImage.mockResolvedValue(Buffer.from('img'));
      mockCtx.prisma.game.update.mockResolvedValue({ id: 1 } as any);
      mockCtx.prisma.game.count.mockResolvedValue(0);

      await service.syncAndConnectGamesWithBGG(1, ctx);

      expect(bgg.resetThrottle).toHaveBeenCalled();
      expect(bgg.getBoardGameBatchByBGGIds).toHaveBeenCalledWith([13]);
      // one update for the bggUpdate (deferred) + one for the cover art pass
      expect(mockCtx.prisma.game.update).toHaveBeenCalledTimes(2);
    });

    it('warns but does not update when no BGG data matches a game in the batch', async () => {
      mockCtx.prisma.game.findMany.mockResolvedValue([
        { id: 1, bggId: 13 },
      ] as any);
      bgg.getBoardGameBatchByBGGIds.mockResolvedValue([] as any);
      mockCtx.prisma.game.count.mockResolvedValue(1);

      await service.syncAndConnectGamesWithBGG(1, ctx);

      expect(mockCtx.prisma.game.update).not.toHaveBeenCalled();
    });
  });

  describe('startSyncAndConnect', () => {
    it('launches the sync in the background and returns "started"', () => {
      const spy = jest
        .spyOn(service, 'syncAndConnectGamesWithBGG')
        .mockResolvedValue(undefined);

      const result = service.startSyncAndConnect(1, ctx, 'dump-url');

      expect(result.status).toBe('started');
      expect(spy).toHaveBeenCalledWith(1, ctx, 'dump-url');
    });

    it('rejects a second concurrent sync with 409', () => {
      // First launch never settles, so the in-flight flag stays set.
      jest
        .spyOn(service, 'syncAndConnectGamesWithBGG')
        .mockReturnValue(new Promise<undefined>(() => {}));

      service.startSyncAndConnect(1, ctx);

      expect(() => service.startSyncAndConnect(1, ctx)).toThrow(ConflictException);
    });

    it('logs and clears the in-flight flag when the background sync fails', async () => {
      jest
        .spyOn(service, 'syncAndConnectGamesWithBGG')
        .mockRejectedValue(new Error('bg boom'));

      const result = service.startSyncAndConnect(1, ctx);
      expect(result.status).toBe('started');

      // Let the rejected fire-and-forget promise settle (catch + finally run).
      await new Promise((r) => setImmediate(r));

      // The flag is cleared, so a subsequent launch is allowed again.
      jest
        .spyOn(service, 'syncAndConnectGamesWithBGG')
        .mockResolvedValue(undefined);
      expect(() => service.startSyncAndConnect(1, ctx)).not.toThrow();
    });
  });

  describe('syncAndConnectGamesWithBGG dump backfill', () => {
    it('backfills from the rank dump first when a dumpUrl is supplied', async () => {
      const backfill = jest
        .spyOn(service, 'backfillBggIdsFromRankDump')
        .mockResolvedValue(0);
      mockCtx.prisma.game.findMany.mockResolvedValue([] as any);
      mockCtx.prisma.game.count.mockResolvedValue(0);

      await service.syncAndConnectGamesWithBGG(1, ctx, 'dump-url');

      expect(backfill).toHaveBeenCalledWith(1, ctx, 'dump-url');
    });
  });

  describe('error handling', () => {
    it('game rejects when the lookup fails', async () => {
      mockCtx.prisma.game.findUnique.mockRejectedValue(new Error('boom'));

      await expect(service.game({ id: 1 }, ctx, { id: 1 })).rejects.toThrow(
        'boom',
      );
    });

    it('games rejects when findMany fails', async () => {
      mockCtx.prisma.game.findMany.mockRejectedValue(new Error('boom'));

      await expect(service.games(1, ctx)).rejects.toThrow('boom');
    });

    it('search rejects when findMany fails', async () => {
      mockCtx.prisma.game.findMany.mockRejectedValue(new Error('boom'));

      await expect(service.search({}, ctx)).rejects.toThrow('boom');
    });

    it('searchWithCount rejects when the transaction fails', async () => {
      mockCtx.prisma.$transaction.mockRejectedValue(new Error('boom'));

      await expect(service.searchWithCount({}, ctx)).rejects.toThrow('boom');
    });

    it('createGame rejects when create fails', async () => {
      mockCtx.prisma.game.create.mockRejectedValue(new Error('boom'));

      await expect(service.createGame({} as any, ctx)).rejects.toThrow('boom');
    });

    it('updateGame rejects when update fails', async () => {
      mockCtx.prisma.game.update.mockRejectedValue(new Error('boom'));

      await expect(
        service.updateGame({ where: { id: 1 }, data: {} }, ctx),
      ).rejects.toThrow('boom');
    });

    it('connectBGGGameByName rejects when the BGG lookup throws', async () => {
      bgg.getBoardGameIdByName.mockRejectedValue(new Error('bgg down'));

      await expect(
        service.connectBGGGameByName(1, 'Catan', ctx),
      ).rejects.toThrow('bgg down');
    });

    it('syncBGGGame rejects when the lookup throws', async () => {
      mockCtx.prisma.game.findUnique.mockRejectedValue(new Error('db down'));

      await expect(service.syncBGGGame(1, ctx)).rejects.toThrow('db down');
    });

    it('syncAndConnectGamesWithBGG rejects when a query fails', async () => {
      mockCtx.prisma.game.findMany.mockRejectedValue(new Error('boom'));

      await expect(service.syncAndConnectGamesWithBGG(1, ctx)).rejects.toThrow(
        'boom',
      );
    });
  });

  describe('getCoverArt', () => {
    it('selects only coverArt and returns it as a Buffer', async () => {
      const bytes = Buffer.from([0xff, 0xd8, 0xff]);
      mockCtx.prisma.game.findUnique.mockResolvedValue({
        coverArt: bytes,
      } as any);

      const result = await service.getCoverArt(1, ctx);

      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result).toEqual(bytes);
      // The explicit select is what overrides PrismaService's global omit.
      expect(mockCtx.prisma.game.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: { coverArt: true },
      });
    });

    it('returns null when the game has no cover art', async () => {
      mockCtx.prisma.game.findUnique.mockResolvedValue({
        coverArt: null,
      } as any);

      expect(await service.getCoverArt(1, ctx)).toBeNull();
    });

    it('returns null when the game does not exist', async () => {
      mockCtx.prisma.game.findUnique.mockResolvedValue(null as any);

      expect(await service.getCoverArt(999, ctx)).toBeNull();
    });
  });
});
