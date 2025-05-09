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
      });

      const collection = await service.collection(1, ctx);

      expect(collection?.id).toBe(1);
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
        organizationId: 1,
      });

      mockCtx.prisma.collection.create.mockResolvedValueOnce({
        id: 1,
        name: 'Test Collection',
        organizationId: 1,
        public: false,
        allowWinning: false,
      });

      mockCtx.prisma.collection.findUnique.mockResolvedValue({
        id: 1,
        name: 'Test Collection',
        organizationId: 1,
        public: false,
        allowWinning: false,
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
      });

      mockCtx.prisma.collection.create.mockResolvedValueOnce({
        id: 1,
        name: 'Test Collection',
        organizationId: 1,
        public: false,
        allowWinning: false,
      });

      mockCtx.prisma.collection.findUnique.mockResolvedValue({
        id: 1,
        name: 'Test Collection',
        organizationId: 1,
        public: false,
        allowWinning: false,
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
      });

      mockCtx.prisma.collection.create.mockResolvedValueOnce({
        id: 1,
        name: 'Test Collection',
        organizationId: 1,
        public: false,
        allowWinning: false,
      });

      mockCtx.prisma.collection.findUnique.mockResolvedValue({
        id: 1,
        name: 'Test Collection',
        organizationId: 1,
        public: false,
        allowWinning: false,
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
      });

      mockCtx.prisma.collection.findUnique.mockResolvedValue({
        id: 1,
        name: 'Test Collection',
        organizationId: 1,
        public: false,
        allowWinning: false,
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
  });
});
