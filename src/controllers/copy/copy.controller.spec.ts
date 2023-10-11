import { Test, TestingModule } from '@nestjs/testing';
import { CopyController } from './copy.controller';
import { CopyService } from '../../services/copy/copy.service';
import { PrismaService } from '../../services/prisma/prisma.service';
import {
  Context,
  MockContext,
  createMockContext,
} from '../../services/prisma/context';
import { OrganizationService } from '../../services/organization/organization.service';

describe('CopyController', () => {
  let controller: CopyController;
  let mockCtx: MockContext;
  let ctx: Context;

  beforeEach(async () => {
    mockCtx = createMockContext();
    ctx = mockCtx as unknown as Context;
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CopyController],
      providers: [CopyService, PrismaService, OrganizationService],
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
        dateRetired: new Date(),
        winnable: true,
        winnerId: null,
        coverArtOverride: null,
        barcode: '*00001*',
        barcodeNumber: 1,
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
        dateAdded: new Date(),
        dateRetired: null,
        winnable: false,
        winnerId: null,
        coverArtOverride: null,
        barcode: '*00001*',
        barcodeNumber: 1,
      });

      const copy = await controller.getCopy(1);

      expect(copy?.id).toBe(1);
    });
  });
});
