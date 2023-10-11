import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../../services/user/user.service';
import { PrismaService } from '../../services/prisma/prisma.service';
import {
  Context,
  MockContext,
  createMockContext,
} from '../../services/prisma/context';

describe('UserController', () => {
  let controller: UserController;
  let mockCtx: MockContext;
  let ctx: Context;

  beforeEach(async () => {
    mockCtx = createMockContext();
    ctx = mockCtx as unknown as Context;
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [PrismaService, UserService],
    }).compile();

    controller = module.get<UserController>(UserController);
    controller.ctx = ctx;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUsedById', () => {
    it('should get a user by id', async () => {
      const user = {
        id: 1,
        email: 'test@geekway.com',
        name: 'Test User',
        superAdmin: false,
        username: 'TestUser',
        pronounsId: 1,
        pronouns: {
          id: 1,
          pronouns: 'She/Her',
        },
      };

      mockCtx.prisma.user.findUnique.mockResolvedValue(user);

      const u = await controller.getUserById('1');

      expect(u.id).toBe(1);
    });

    it('should get a user by email', async () => {
      const user = {
        id: 1,
        email: 'test@geekway.com',
        name: 'Test User',
        superAdmin: false,
        username: 'TestUser',
        pronounsId: 1,
        pronouns: {
          id: 1,
          pronouns: 'She/Her',
        },
      };

      mockCtx.prisma.user.findUnique.mockResolvedValue(user);

      const u = await controller.getUserById('test@geekway.com');

      expect(u.id).toBe(1);
    });

    it('should throw a not found error', async () => {
      mockCtx.prisma.user.findUnique.mockResolvedValue(null);

      expect(controller.getUserById('test@geekway.com')).rejects.toThrow();
    });
  });
});
