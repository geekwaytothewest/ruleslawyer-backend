import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Context, MockContext, createMockContext } from '../prisma/context';

describe('UserService', () => {
  let service: UserService;
  let mockCtx: MockContext;
  let ctx: Context;

  beforeEach(async () => {
    mockCtx = createMockContext();
    ctx = mockCtx as unknown as Context;
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('user', () => {
    it('should return a user count', async () => {
      mockCtx.prisma.user.count.mockResolvedValue(4);

      const count = await service.getUserCount(ctx);

      expect(count).toBe(4);
    });
  });
});
