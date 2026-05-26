import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CollectionController } from './collection.controller';
import { CollectionService } from '../../services/collection/collection.service';
import {
  Context,
  MockContext,
  createMockContext,
} from '../../services/prisma/context';
import { ConventionModule } from '../../modules/convention/convention.module';

describe('CollectionController', () => {
  let controller: CollectionController;
  let collectionService: CollectionService;
  let mockCtx: MockContext;
  let ctx: Context;

  beforeEach(async () => {
    mockCtx = createMockContext();
    ctx = mockCtx as unknown as Context;
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConventionModule],
    }).compile();

    controller = module.get<CollectionController>(CollectionController);
    collectionService = module.get<CollectionService>(CollectionService);
    controller.ctx = ctx;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('collection', () => {
    it('returns the collection when found', async () => {
      jest
        .spyOn(collectionService, 'collection')
        .mockResolvedValue({ id: 1 } as any);

      const result = await controller.collection(1);

      expect(result).toEqual({ id: 1 });
    });

    it('rejects with NotFoundException when missing', async () => {
      jest.spyOn(collectionService, 'collection').mockResolvedValue(null);

      await expect(controller.collection(1)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('propagates service errors', async () => {
      jest
        .spyOn(collectionService, 'collection')
        .mockRejectedValue(new Error('boom'));

      await expect(controller.collection(1)).rejects.toThrow('boom');
    });
  });

  describe('collectionCopiesByGames', () => {
    it('returns the copies-by-games result', async () => {
      jest
        .spyOn(collectionService, 'collectionCopiesByGames')
        .mockResolvedValue({ id: 1, games: [] } as any);

      const result = await controller.collectionCopiesByGames(1, 10, '');

      expect(result).toEqual({ id: 1, games: [] });
      expect(collectionService.collectionCopiesByGames).toHaveBeenCalledWith(
        1,
        10,
        '',
        ctx,
      );
    });
  });

  describe('updateCollection', () => {
    it('rejects when name is not set', async () => {
      await expect(
        controller.updateCollection(1, { allowWinning: true } as any),
      ).rejects.toBe('name not set');
    });

    it('rejects when allowWinning is not a boolean', async () => {
      await expect(
        controller.updateCollection(1, { name: 'My Collection' } as any),
      ).rejects.toBe('allowWinning not set');
    });

    it('updates the collection when the body is valid', async () => {
      const spy = jest
        .spyOn(collectionService, 'updateCollection')
        .mockResolvedValue({ id: 1 } as any);

      const result = await controller.updateCollection(1, {
        name: 'My Collection',
        allowWinning: true,
      } as any);

      expect(result).toEqual({ id: 1 });
      expect(spy).toHaveBeenCalledWith(1, 'My Collection', true, ctx);
    });
  });

  describe('deleteCollection', () => {
    it('rejects when the collection is not found', async () => {
      jest.spyOn(collectionService, 'collection').mockResolvedValue(null);

      await expect(controller.deleteCollection(1)).rejects.toBe(
        'Collection not found',
      );
    });

    it('rejects when the collection still has copies', async () => {
      jest
        .spyOn(collectionService, 'collection')
        .mockResolvedValue({ id: 1, _count: { copies: 3, conventions: 0 } } as any);

      await expect(controller.deleteCollection(1)).rejects.toBe(
        'Collection still has copies and cannot be deleted.',
      );
    });

    it('rejects when the collection still has conventions', async () => {
      jest
        .spyOn(collectionService, 'collection')
        .mockResolvedValue({ id: 1, _count: { copies: 0, conventions: 2 } } as any);

      await expect(controller.deleteCollection(1)).rejects.toBe(
        'Collection still has conventions and cannot be deleted.',
      );
    });

    it('deletes when the collection is empty', async () => {
      jest
        .spyOn(collectionService, 'collection')
        .mockResolvedValue({ id: 1, _count: { copies: 0, conventions: 0 } } as any);
      const spy = jest
        .spyOn(collectionService, 'deleteCollection')
        .mockResolvedValue({ id: 1 } as any);

      const result = await controller.deleteCollection(1);

      expect(result).toEqual({ id: 1 });
      expect(spy).toHaveBeenCalledWith(1, ctx);
    });
  });
});
