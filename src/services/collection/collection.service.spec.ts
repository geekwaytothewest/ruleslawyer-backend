import { Test, TestingModule } from '@nestjs/testing';
import { CollectionService } from './collection.service';
import { Context, MockContext, createMockContext } from '../prisma/context';
import { Prisma } from '@prisma/client';

describe('CollectionService', () => {
  let service: CollectionService;
  let mockCtx: MockContext;
  let ctx: Context;

  beforeEach(async () => {
    mockCtx = createMockContext();
    ctx = mockCtx as unknown as Context;
    const module: TestingModule = await Test.createTestingModule({
      providers: [CollectionService],
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
      });

      const collection = await service.collection(1, ctx);

      expect(collection?.id).toBe(1);
    });
  });

  describe('importCollection', () => {
    it('should import a collection', async () => {
      mockCtx.prisma.collection.create.mockResolvedValueOnce({
        id: 1,
        name: 'Test Collection',
        organizationId: 1,
        public: false,
      });

      mockCtx.prisma.copy.create.mockResolvedValueOnce({
        id: 1,
        gameId: 1,
        dateAdded: new Date(),
        dateRetired: null,
        winnable: false,
        winnerId: null,
        barcode: '*00001*',
        barcodeNumber: 1,
        coverArtOverride: null,
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
      });

      const findManyResolved = [
        {
          id: 1,
          gameId: 1,
          winnable: false,
          winnerId: null,
          coverArtOverride: null,
          dateAdded: new Date(),
          dateRetired: null,
          barcode: '*00001*',
          barcodeNumber: 1,
          collections: [
            {
              id: 1,
              name: 'Test Collection',
              organizationId: 1,
              public: false,
            },
          ],
        },
      ];
      mockCtx.prisma.copy.findMany.mockResolvedValueOnce(findManyResolved);

      mockCtx.prisma.copy.delete.mockResolvedValueOnce({
        id: 1,
        gameId: 1,
        winnable: false,
        winnerId: null,
        coverArtOverride: null,
        dateAdded: new Date(),
        dateRetired: null,
        barcode: '*00001*',
        barcodeNumber: 1,
      });

      expect(await service.deleteCollection(1, ctx)).toBe('deleted');
    });
  });
});
