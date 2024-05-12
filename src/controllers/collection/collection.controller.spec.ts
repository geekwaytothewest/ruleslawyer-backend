import { Test, TestingModule } from '@nestjs/testing';
import { CollectionController } from './collection.controller';
import {
  Context,
  MockContext,
  createMockContext,
} from '../../services/prisma/context';
import { ConventionModule } from '../../modules/convention/convention.module';

describe('ConventionController', () => {
  let controller: CollectionController;
  let mockCtx: MockContext;
  let ctx: Context;

  beforeEach(async () => {
    mockCtx = createMockContext();
    ctx = mockCtx as unknown as Context;
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConventionModule],
    }).compile();

    controller = module.get<CollectionController>(CollectionController);
    controller.ctx = ctx;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
