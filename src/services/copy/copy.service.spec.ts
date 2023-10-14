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
        barcodeNumber: 1,
        winnable: false,
        winnerId: null,
        coverArtOverride: Buffer.from(''),
        dateRetired: null,
        collectionId: 1,
      });

      const copy = await service.copy({ id: 1 }, ctx);

      expect(copy?.id).toBe(1);
    });
  });

  describe('createCopy', () => {
    it('should create a copy', async () => {
      mockCtx.prisma.copy.create.mockResolvedValue({
        id: 1,
        gameId: 1,
        dateAdded: new Date(),
        barcode: '*00001*',
        barcodeNumber: 1,
        winnable: false,
        winnerId: null,
        coverArtOverride: Buffer.from(''),
        dateRetired: null,
        collectionId: 1,
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
          barcodeNumber: 1,
          winnable: false,
          winner: undefined,
          coverArtOverride: Buffer.from(''),
          dateRetired: null,
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
        barcodeNumber: 2,
        winnable: true,
        winnerId: null,
        coverArtOverride: Buffer.from(''),
        dateRetired: null,
        collectionId: 1,
      });

      const copy = await service.updateCopy(
        {
          where: {
            id: 1,
          },
          data: {
            dateAdded: new Date(),
            barcode: '*00002*',
            barcodeNumber: 2,
            winnable: true,
            coverArtOverride: Buffer.from(''),
            dateRetired: null,
          },
        },
        ctx,
      );

      expect(copy.barcodeNumber).toBe(2);
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
        barcodeNumber: 1,
        winnable: false,
        winnerId: null,
        coverArtOverride: Buffer.from(''),
        collectionId: 1,
        collection: {
          id: 1,
          name: 'Geekway Library',
        },
      };
      mockCtx.prisma.copy.findUnique.mockResolvedValue(query);

      const copy = await service.copyWithCollection({ id: 1 }, ctx);

      expect(copy?.collection.id).toBe(1);
    });
  });
});
