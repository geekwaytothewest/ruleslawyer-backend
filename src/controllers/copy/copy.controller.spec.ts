import { Test, TestingModule } from '@nestjs/testing';
import { CopyController } from './copy.controller';
import {
  Context,
  MockContext,
  createMockContext,
} from '../../services/prisma/context';
import { CopyModule } from '../../modules/copy/copy.module';

describe('CopyController', () => {
  let controller: CopyController;
  let mockCtx: MockContext;
  let ctx: Context;

  beforeEach(async () => {
    mockCtx = createMockContext();
    ctx = mockCtx as unknown as Context;
    const module: TestingModule = await Test.createTestingModule({
      imports: [CopyModule],
    }).compile();

    controller = module.get<CopyController>(CopyController);
    controller.ctx = ctx;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updateCopy', () => {
    it('should update a copy', async () => {
      mockCtx.prisma.copy.update.mockResolvedValue({
        id: 1,
        gameId: 1,
        dateAdded: new Date(),
        comments: null,
        dateRetired: new Date(),
        winnable: true,
        winnerId: null,
        coverArtOverride: null,
        barcode: '*00001*',
        barcodeLabel: '1',
        collectionId: 1,
        organizationId: 1,
      });

      const copy = await controller.updateCopy(1, {
        winnable: true,
      });

      expect(copy?.winnable).toBeTruthy();
    });
  });

  describe('getCopy', () => {
    it('should get a copy', async () => {
      mockCtx.prisma.copy.findUnique.mockResolvedValue({
        id: 1,
        gameId: 1,
        comments: null,
        dateAdded: new Date(),
        dateRetired: null,
        winnable: false,
        winnerId: null,
        coverArtOverride: null,
        barcode: '*00001*',
        barcodeLabel: '1',
        collectionId: 1,
        organizationId: 1,
      });

      const copy = await controller.getCopy(1);

      expect(copy?.id).toBe(1);
    });
  });

  describe('getCover', () => {
    it('streams the override image with a sniffed content type', async () => {
      const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      mockCtx.prisma.copy.findUnique.mockResolvedValue({
        coverArtOverride: png,
      } as any);

      const file = await controller.getCover(1);

      expect(file.getStream().read()).toEqual(png);
      expect(file.options.type).toBe('image/png');
    });

    it('404s when the copy has no override', async () => {
      mockCtx.prisma.copy.findUnique.mockResolvedValue({
        coverArtOverride: null,
      } as any);

      await expect(controller.getCover(1)).rejects.toThrow(
        'No cover-art override set for copy 1.',
      );
    });
  });
});
