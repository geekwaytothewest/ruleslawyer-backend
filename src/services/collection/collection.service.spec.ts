import { Test, TestingModule } from '@nestjs/testing';
import { CollectionService } from './collection.service';
import { Context, MockContext, createMockContext } from '../prisma/context';

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
      mockCtx.prisma.collection.create.mockResolvedValue({
        id: 1,
        name: 'Test Collection',
        organizationId: 1,
        public: false,
      });

      mockCtx.prisma.copy.create.mockResolvedValue({
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

      mockCtx.prisma.game.create.mockResolvedValue({
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
        'Test Collection',
        Buffer.from('test title,1'),
        ctx,
      );

      expect(result).toBe(1);
    });
  });

  describe('deleteCollection', () => {
    it('should delete a collection', async () => {
      mockCtx.prisma.collection.delete.mockResolvedValue({
        id: 1,
        name: 'Test Collection',
        organizationId: 1,
        public: false,
      });

      expect(await service.deleteCollection(1, ctx)).toBe('deleted');
    });
  });
});
