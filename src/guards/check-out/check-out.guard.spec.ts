import { Test, TestingModule } from '@nestjs/testing';
import { MockContext, createMockContext } from '../../services/prisma/context';
import { CheckOutGuard } from './check-out.guard';
import { CheckOutModule } from '../../modules/check-out/check-out.module';

describe('CheckOutGuard', () => {
  let guard: CheckOutGuard;
  let mockCtx: MockContext;

  beforeEach(async () => {
    mockCtx = createMockContext();
    const module: TestingModule = await Test.createTestingModule({
      imports: [CheckOutModule],
    }).compile();

    guard = module.get<CheckOutGuard>(CheckOutGuard);
    guard.ctx = mockCtx;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });
});
