import { Test, TestingModule } from '@nestjs/testing';
import { CopyService } from './copy.service';
import { Context, MockContext, createMockContext } from '../prisma/context';

describe('CopyService', () => {
  let service: CopyService;
  let mockCtx: MockContext;
  let ctx: Context;

  beforeEach(async () => {
    mockCtx = createMockContext();
    ctx = mockCtx as unknown as Context;
    const module: TestingModule = await Test.createTestingModule({
      providers: [CopyService],
    }).compile();

    service = module.get<CopyService>(CopyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('copy', () => {
    it('should get a copy', async () => {
      mockCtx.prisma.copy.findUnique.mockResolvedValue({
        id: 1,
        gameId: 1,
        dateAdded: new Date(),
        barcode: '*00001*',
        barcodeLabel: '1',
        winnable: false,
        winnerId: null,
        coverArtOverride: Buffer.from(''),
        dateRetired: null,
        collectionId: 1,
        organizationId: 1,
        comments: null,
      });

      const copy = await service.copy({ id: 1 }, ctx);

      expect(copy?.id).toBe(1);
    });
  });

  describe('createCopy', () => {
    it('should create a copy', async () => {
      mockCtx.prisma.copy.upsert.mockResolvedValue({
        id: 1,
        gameId: 1,
        dateAdded: new Date(),
        barcode: '*00001*',
        barcodeLabel: '1',
        winnable: false,
        winnerId: null,
        coverArtOverride: Buffer.from(''),
        dateRetired: null,
        collectionId: 1,
        organizationId: 1,
        comments: null,
      });

      const copy = await service.createCopy(
        {
          game: {
            connect: {
              id: 1,
            },
          },
          dateAdded: new Date(),
          barcode: '*00001*',
          barcodeLabel: '1',
          winnable: false,
          winner: undefined,
          coverArtOverride: Buffer.from(''),
          dateRetired: null,
          organization: {
            connect: {
              id: 1,
            },
          },
        },
        ctx,
      );

      expect(copy?.id).toBe(1);
    });
  });

  describe('updateCopy', () => {
    it('should update a copy', async () => {
      mockCtx.prisma.copy.update.mockResolvedValue({
        id: 1,
        gameId: 1,
        dateAdded: new Date(),
        barcode: '*00002*',
        barcodeLabel: '2',
        winnable: true,
        winnerId: null,
        coverArtOverride: Buffer.from(''),
        dateRetired: null,
        collectionId: 1,
        organizationId: 1,
        comments: null,
      });

      const copy = await service.updateCopy(
        {
          where: {
            id: 1,
          },
          data: {
            dateAdded: new Date(),
            barcode: '*00002*',
            barcodeLabel: '2',
            winnable: true,
            coverArtOverride: Buffer.from(''),
            dateRetired: null,
          },
        },
        ctx,
      );

      expect(copy.barcodeLabel).toBe('2');
    });
  });

  describe('copyWithCollection', () => {
    it('should return a copy with a collection', async () => {
      const query = {
        id: 1,
        gameId: 1,
        dateAdded: new Date(),
        dateRetired: null,
        barcode: '*00001*',
        barcodeLabel: '1',
        winnable: false,
        winnerId: null,
        coverArtOverride: Buffer.from(''),
        collectionId: 1,
        comments: null,
        collection: {
          id: 1,
          name: 'Geekway Library',
        },
        organizationId: 1,
      };
      mockCtx.prisma.copy.findUnique.mockResolvedValue(query);

      const copy = await service.copyWithCollection({ id: 1 }, ctx);

      expect(copy?.collection.id).toBe(1);
    });
  });

  describe('copyWithCheckOutsGameAndCollection', () => {
    it('should return a copy with checkouts, a game, and collection', async () => {
      const query = {
        id: 1,
        gameId: 1,
        dateAdded: new Date(),
        dateRetired: null,
        barcode: '*00001*',
        barcodeLabel: '1',
        winnable: false,
        winnerId: null,
        coverArtOverride: Buffer.from(''),
        collectionId: 1,
        comments: null,
        collection: {
          id: 1,
          name: 'Geekway Library',
        },
        game: {
          id: 1,
          name: 'Test Game',
        },
        checkOuts: [
          {
            id: 1,
          },
        ],
        organizationId: 1,
      };
      mockCtx.prisma.copy.findUnique.mockResolvedValue(query);

      const copy = await service.copyWithCheckOutsGameAndCollection(
        { id: 1 },
        ctx,
      );

      expect(copy?.checkOuts.length).toBe(1);
    });
  });

  describe('searchCopies', () => {
    it('should return so many copies', async () => {
      const query = [
        {
          id: 1,
          gameId: 1,
          dateAdded: new Date(),
          dateRetired: null,
          barcode: '*00001*',
          barcodeLabel: '1',
          winnable: false,
          winnerId: null,
          coverArtOverride: Buffer.from(''),
          collectionId: 1,
          comments: null,
          collection: {
            id: 1,
            name: 'Geekway Library',
          },
          game: {
            id: 1,
            name: 'Test Game',
          },
          checkOuts: [
            {
              id: 1,
            },
          ],
          organizationId: 1,
        },
      ];
      mockCtx.prisma.copy.findMany.mockResolvedValue(query);

      const copies = await service.searchCopies({ winnable: false }, ctx);

      expect(copies.length).toBe(1);
    });
  });
});
