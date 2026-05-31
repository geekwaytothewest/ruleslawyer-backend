import { Test, TestingModule } from '@nestjs/testing';
import { CollectionService } from './collection.service';
import { Context, MockContext, createMockContext } from '../prisma/context';
import { Prisma } from '@prisma/client';
import { CollectionModule } from '../../modules/collection/collection.module';

describe('CollectionService', () => {
  let service: CollectionService;
  let mockCtx: MockContext;
  let ctx: Context;

  beforeEach(async () => {
    mockCtx = createMockContext();
    ctx = mockCtx as unknown as Context;
    const module: TestingModule = await Test.createTestingModule({
      imports: [CollectionModule],
    }).compile();

    service = module.get<CollectionService>(CollectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('collection', () => {
    it('should return a collection', async () => {
      mockCtx.prisma.collection.findUnique.mockResolvedValue({
        id: 1,
        name: 'Test Collection',
        organizationId: 1,
        public: false,
        allowWinning: false,
        archived: false,
      });

      const collection = await service.collection(1, ctx);

      expect(collection?.id).toBe(1);
    });
  });

  describe('collectionCopiesByGames', () => {
    it('caps the page size and returns pagination metadata', async () => {
      mockCtx.prisma.collection.findUnique.mockResolvedValue({
        id: 1,
        name: 'Test Collection',
        organizationId: 1,
        public: false,
        allowWinning: false,
        archived: false,
      });
      mockCtx.prisma.$transaction.mockResolvedValue([[{ id: 1 }], 2500] as any);

      // limit above the cap; second page requested
      const result = await service.collectionCopiesByGames(1, 5000, '', ctx, 2);

      const gameArgs = mockCtx.prisma.game.findMany.mock.calls[0][0] as any;
      expect(gameArgs.take).toBe(500);
      expect(gameArgs.skip).toBe(500);

      expect(result.games).toEqual([{ id: 1 }]);
      expect(result.total).toBe(2500);
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(500);
      expect(result.totalPages).toBe(5);
      expect(result.hasMore).toBe(true);
    });
  });

  describe('collectionsByOrgWithCopies', () => {
    it('should return an org collections including their copies', async () => {
      mockCtx.prisma.collection.findMany.mockResolvedValue([
        { id: 1, name: 'Test Collection', copies: [] },
      ] as any);

      const collections = await service.collectionsByOrgWithCopies(1, ctx);

      expect(collections.length).toBe(1);
      expect(mockCtx.prisma.collection.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { organizationId: 1 } }),
      );
    });
  });

  describe('collectionsByOrg', () => {
    it('should return all an org collections', async () => {
      mockCtx.prisma.collection.findMany.mockResolvedValue([
        {
          id: 1,
          name: 'Test Collection',
          organizationId: 1,
          public: false,
          allowWinning: false,
          archived: false,
        },
      ]);

      const collections = await service.collectionsByOrg(1, ctx);

      expect(collections.length).toBe(1);
    });
  });

  describe('importCollection', () => {
    it('should import a collection', async () => {
      mockCtx.prisma.collection.create.mockResolvedValueOnce({
        id: 1,
        name: 'Test Collection',
        organizationId: 1,
        public: false,
        allowWinning: false,
        archived: false,
      });

      mockCtx.prisma.copy.create.mockResolvedValueOnce({
        id: 1,
        gameId: 1,
        dateAdded: new Date(),
        comments: null,
        dateRetired: null,
        winnable: false,
        winnerId: null,
        barcode: '*00001*',
        barcodeLabel: '1',
        coverArtOverride: null,
        collectionId: 1,
        organizationId: 1,
      });

      mockCtx.prisma.game.create.mockResolvedValueOnce({
        id: 1,
        name: 'test title',
        minPlayers: null,
        maxPlayers: null,
        bggId: null,
        bggRank: null,
        bggRating: null,
        artist: null,
        coverArt: null,
        designer: null,
        lastBGGSync: null,
        longDescription: null,
        maxTime: null,
        minAge: null,
        minTime: null,
        publisher: null,
        shortDescription: null,
        weight: null,
        yearPublished: null,
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

      const result = await service.importCollection(
        1,
        {
          name: {
            value: 'Test Collection',
          },
        },
        Buffer.from('test title,1'),
        ctx,
      );

      expect(result).toMatchObject({
        collectionId: 1,
        importCount: 1,
      });
    });

    it('should create a play and win', async () => {
      mockCtx.prisma.collection.create.mockResolvedValueOnce({
        id: 1,
        name: 'Test Collection',
        organizationId: 1,
        public: false,
        allowWinning: false,
        archived: false,
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

      const result = await service.importCollection(
        1,
        {
          name: {
            value: 'Test Collection',
          },
          type: {
            value: 'Play and Win',
          },
          conventionId: {
            value: 1,
          },
        },
        Buffer.from('test title,1'),
        ctx,
      );

      expect(result).toMatchObject({
        collectionId: 1,
        importCount: 1,
      });
    });

    it('should create door prizes', async () => {
      mockCtx.prisma.collection.create.mockResolvedValueOnce({
        id: 1,
        name: 'Test Collection',
        organizationId: 1,
        public: false,
        allowWinning: false,
        archived: false,
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

      const result = await service.importCollection(
        1,
        {
          name: {
            value: 'Test Collection',
          },
          type: {
            value: 'Door Prizes',
          },
          conventionId: {
            value: 1,
          },
        },
        Buffer.from('test title,1'),
        ctx,
      );

      expect(result).toMatchObject({
        collectionId: 1,
        importCount: 1,
      });
    });

    it('should error with missing name', async () => {
      const result = service.importCollection(
        1,
        {},
        Buffer.from('test title,1'),
        ctx,
      );
      expect(result).rejects.toBe('missing name');
    });

    it('should error with invalid type', async () => {
      const result = service.importCollection(
        1,
        {
          name: {
            value: 'test name',
          },
          type: {
            value: 'bad',
          },
        },
        Buffer.from('test title,1'),
        ctx,
      );
      expect(result).rejects.toBe('invalid type');
    });

    it('should error with missing convention id', async () => {
      const result = service.importCollection(
        1,
        {
          name: {
            value: 'test name',
          },
          type: {
            value: 'Play and Win',
          },
        },
        Buffer.from('test title,1'),
        ctx,
      );
      expect(result).rejects.toBe('missing convention id');
    });

    it('should error on duplicate collection name', async () => {
      mockCtx.prisma.collection.create.mockImplementationOnce(() => {
        throw new Prisma.PrismaClientKnownRequestError('mocked', {
          code: 'P2002',
          clientVersion: '',
          meta: undefined,
          batchRequestIdx: undefined,
        });
      });

      expect(
        service.importCollection(
          1,
          {
            name: {
              value: 'Test Collection',
            },
          },
          Buffer.from('test title,1'),
          ctx,
        ),
      ).rejects.toBe('a collection already exists with that name');
    });

    it('should error differently', async () => {
      mockCtx.prisma.collection.create.mockImplementationOnce(() => {
        throw new Prisma.PrismaClientKnownRequestError('mocked', {
          code: 'P42069',
          clientVersion: '',
          meta: undefined,
          batchRequestIdx: undefined,
        });
      });

      expect(
        service.importCollection(
          1,
          {
            name: {
              value: 'Test Collection',
            },
          },
          Buffer.from('test title,1'),
          ctx,
        ),
      ).rejects.toBe('mocked');
    });

    it('should fail the csv parse', async () => {
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

      expect(
        service.importCollection(
          1,
          {
            name: {
              value: 'Test Collection',
            },
          },
          Buffer.from('test title,"8*,1'),
          ctx,
        ),
      ).rejects.toBe('invalid csv file');
    });
  });

  describe('deleteCollection', () => {
    it('should delete a collection', async () => {
      mockCtx.prisma.collection.delete.mockResolvedValueOnce({
        id: 1,
        name: 'Test Collection',
        organizationId: 1,
        public: false,
        allowWinning: false,
        archived: false,
      });

      const findManyResolved = [
        {
          id: 1,
          gameId: 1,
          winnable: false,
          winnerId: null,
          coverArtOverride: null,
          dateAdded: new Date(),
          comments: null,
          dateRetired: null,
          barcode: '*00001*',
          barcodeLabel: '1',
          collectionId: 1,
          collection: {
            id: 1,
            name: 'Test Collection',
            organizationId: 1,
            public: false,
          },
          organizationId: 1,
        },
      ];
      mockCtx.prisma.copy.findMany.mockResolvedValueOnce(findManyResolved);

      mockCtx.prisma.copy.delete.mockResolvedValueOnce({
        id: 1,
        gameId: 1,
        winnable: false,
        winnerId: null,
        comments: null,
        coverArtOverride: null,
        dateAdded: new Date(),
        dateRetired: null,
        barcode: '*00001*',
        barcodeLabel: '1',
        collectionId: 1,
        organizationId: 1,
      });

      expect(await service.deleteCollection(1, ctx)).toBe('deleted');
    });

    it('refuses to delete a collection tied to a convention', async () => {
      mockCtx.prisma.convention.count.mockResolvedValue(1 as any);

      const result = await service.deleteCollection(1, ctx);

      expect(result).toBe('cannot delete a collection tied to a convention');
      expect(mockCtx.prisma.collection.delete).not.toHaveBeenCalled();
    });

    it('rejects when the lookup fails', async () => {
      mockCtx.prisma.convention.count.mockRejectedValue(new Error('db error'));

      await expect(service.deleteCollection(1, ctx)).rejects.toThrow(
        'db error',
      );
    });
  });

  describe('collectionCopiesByGames with a filter', () => {
    it('builds a name-search where clause when a filter is supplied', async () => {
      mockCtx.prisma.collection.findUnique.mockResolvedValue({ id: 1 } as any);
      mockCtx.prisma.$transaction.mockResolvedValue([[], 0] as any);

      await service.collectionCopiesByGames(1, 10, 'catan', ctx, 1);

      const gameArgs = mockCtx.prisma.game.findMany.mock.calls[0][0] as any;
      expect(gameArgs.where.AND).toBeDefined();
      expect(gameArgs.where.AND[0].OR).toBeDefined();
    });

    it('falls back to the cap and first page when limit and page are missing', async () => {
      mockCtx.prisma.collection.findUnique.mockResolvedValue({ id: 1 } as any);
      mockCtx.prisma.$transaction.mockResolvedValue([[], 0] as any);

      const result = await service.collectionCopiesByGames(
        1,
        undefined as any,
        '',
        ctx,
      );

      const gameArgs = mockCtx.prisma.game.findMany.mock.calls[0][0] as any;
      expect(gameArgs.take).toBe(500);
      expect(gameArgs.skip).toBe(0);
      expect(result.page).toBe(1);
    });
  });

  describe('createCollection', () => {
    it('creates a collection', async () => {
      mockCtx.prisma.collection.create.mockResolvedValue({ id: 1 } as any);

      const result = await service.createCollection(1, 1, 'New', false, ctx);

      expect(result.id).toBe(1);
    });

    it('rejects when the create throws', async () => {
      mockCtx.prisma.collection.create.mockImplementation(() => {
        throw new Error('db error');
      });

      await expect(
        service.createCollection(1, 1, 'New', false, ctx),
      ).rejects.toThrow('db error');
    });
  });

  describe('updateCollection', () => {
    it('updates a collection', async () => {
      mockCtx.prisma.collection.update.mockResolvedValue({
        id: 1,
        name: 'Updated',
      } as any);

      const result = await service.updateCollection(1, 'Updated', true, ctx);

      expect(result.name).toBe('Updated');
    });

    it('rejects when the update fails', async () => {
      mockCtx.prisma.collection.update.mockRejectedValue(new Error('db error'));

      await expect(
        service.updateCollection(1, 'Updated', true, ctx),
      ).rejects.toThrow('db error');
    });
  });

  describe('archiveCollection', () => {
    it('archives a collection', async () => {
      mockCtx.prisma.collection.update.mockResolvedValue({
        id: 1,
        archived: true,
      } as any);

      const result = await service.archiveCollection(1, ctx);

      expect(result.archived).toBe(true);
      expect(mockCtx.prisma.collection.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { archived: true },
      });
    });

    it('rejects when the update fails', async () => {
      mockCtx.prisma.collection.update.mockRejectedValue(new Error('db error'));

      await expect(service.archiveCollection(1, ctx)).rejects.toThrow(
        'db error',
      );
    });
  });

  describe('importCollection edge cases', () => {
    it('creates a winnable collection when allowWinning is "true"', async () => {
      mockCtx.prisma.collection.create.mockResolvedValue({
        id: 1,
        allowWinning: true,
      } as any);
      mockCtx.prisma.collection.findUnique.mockResolvedValue({
        id: 1,
        allowWinning: true,
      } as any);
      mockCtx.prisma.copy.create.mockResolvedValue({ id: 1, gameId: 1 } as any);
      mockCtx.prisma.game.findUnique.mockResolvedValue({
        id: 1,
        maxPlayers: 4,
      } as any);

      await service.importCollection(
        1,
        {
          name: { value: 'Winnable' },
          allowWinning: { value: 'true' },
        },
        Buffer.from('test title,1,4'),
        ctx,
      );

      const createArgs = mockCtx.prisma.collection.create.mock
        .calls[0][0] as any;
      expect(createArgs.data.allowWinning).toBe(true);
    });

    it('rejects when the created collection is null', async () => {
      mockCtx.prisma.collection.create.mockResolvedValue(null as any);

      await expect(
        service.importCollection(
          1,
          { name: { value: 'Test Collection' } },
          Buffer.from('test title,1'),
          ctx,
        ),
      ).rejects.toBe('could not create collection');
    });
  });

  describe('uploadCopies', () => {
    it('keeps importing when a single copy fails to create', async () => {
      mockCtx.prisma.collection.findUnique.mockResolvedValue({
        id: 1,
        allowWinning: false,
      } as any);
      jest
        .spyOn(service['copyService'], 'createCopy')
        .mockRejectedValue(new Error('dup barcode'));
      mockCtx.prisma.game.findUnique.mockResolvedValue(null);

      const result: any = await service.uploadCopies(
        1,
        1,
        Buffer.from('test title,1,4'),
        ctx,
      );

      // The row failed, so nothing was imported, but the run still resolves.
      expect(result.importCount).toBe(0);
    });

    it('continues when updating the game maxPlayers fails', async () => {
      mockCtx.prisma.collection.findUnique.mockResolvedValue({
        id: 1,
        allowWinning: false,
      } as any);
      jest
        .spyOn(service['copyService'], 'createCopy')
        .mockResolvedValue({ id: 1, gameId: 1 } as any);
      // Existing maxPlayers differs from the CSV value, so an update is attempted.
      mockCtx.prisma.game.findUnique.mockResolvedValue({
        id: 1,
        maxPlayers: 2,
      } as any);
      mockCtx.prisma.game.update.mockRejectedValue(new Error('update failed'));

      const result: any = await service.uploadCopies(
        1,
        1,
        Buffer.from('test title,1,4'),
        ctx,
      );

      expect(result.importCount).toBe(1);
    });

    it('rejects when the collection lookup fails', async () => {
      mockCtx.prisma.collection.findUnique.mockRejectedValue(
        new Error('db error'),
      );

      await expect(
        service.uploadCopies(1, 1, Buffer.from('test title,1,4'), ctx),
      ).rejects.toThrow('db error');
    });
  });
});
