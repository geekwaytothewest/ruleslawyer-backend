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
    it('should return a user', async () => {
      mockCtx.prisma.user.findUnique.mockResolvedValue({
        id: 1,
        name: 'Test User',
        email: 'test@geekway.com',
        username: 'testuser',
        superAdmin: false,
        pronounsId: 1,
      });

      const user = await service.user({ id: 1 }, ctx);

      expect(user?.id).toBe(1);
    });
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      mockCtx.prisma.user.create.mockResolvedValue({
        id: 1,
        name: 'Test User',
        email: 'test@geekway.com',
        username: 'testuser',
        superAdmin: false,
        pronounsId: 1,
      });

      const user = await service.createUser(
        {
          name: 'Test User',
          email: 'test@geekway.com',
          username: 'testuser',
          superAdmin: false,
        },
        ctx,
      );

      expect(user?.id).toBe(1);
    });
  });

  describe('updateUser', () => {
    it('should update', async () => {
      mockCtx.prisma.user.update.mockResolvedValue({
        id: 1,
        email: 'test@geekway.com',
        name: 'test user',
        superAdmin: false,
        username: 'testuser',
        pronounsId: 1,
      });

      const user = await service.updateUser(
        {
          where: {
            id: 1,
          },
          data: {
            superAdmin: false,
          },
        },
        ctx,
      );

      expect(user.superAdmin).toBe(false);
    });
  });

  describe('getUserCount', () => {
    it('should return a count', async () => {
      mockCtx.prisma.user.count.mockResolvedValue(1);

      expect(await service.getUserCount(ctx)).toBe(1);
    });
  });
});
