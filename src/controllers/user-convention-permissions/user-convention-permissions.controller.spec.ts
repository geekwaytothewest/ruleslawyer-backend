import { Test, TestingModule } from '@nestjs/testing';
import { UserConventionPermissionsController } from './user-convention-permissions.controller';
import {
  Context,
  MockContext,
  createMockContext,
} from '../../services/prisma/context';
import { UserConventionPermissionsModule } from '../../modules/user-convention-permissions/user-convention-permissions.module';

describe('UserConventionPermissionsController', () => {
  let controller: UserConventionPermissionsController;
  let mockCtx: MockContext;
  let ctx: Context;

  beforeEach(async () => {
    mockCtx = createMockContext();
    ctx = mockCtx as unknown as Context;
    const module: TestingModule = await Test.createTestingModule({
      imports: [UserConventionPermissionsModule],
    }).compile();

    controller = module.get<UserConventionPermissionsController>(
      UserConventionPermissionsController,
    );
    controller.ctx = ctx;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserConventionPermissions', () => {
    it('returns the convention permissions for a user', async () => {
      mockCtx.prisma.userConventionPermissions.findMany.mockResolvedValue([
        { id: 1 },
        { id: 2 },
      ] as any);

      const result = await controller.getUserConventionPermissions('5');

      expect(result).toHaveLength(2);
      expect(
        mockCtx.prisma.userConventionPermissions.findMany,
      ).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 5 } }),
      );
    });
  });

  describe('getUserConventionCount', () => {
    it('returns the convention permission count for a user', async () => {
      mockCtx.prisma.userConventionPermissions.count.mockResolvedValue(4);

      const result = await controller.getUserConventionCount('5');

      expect(result).toBe(4);
      expect(
        mockCtx.prisma.userConventionPermissions.count,
      ).toHaveBeenCalledWith({ where: { userId: 5 } });
    });
  });

  describe('deleteConventionPermission', () => {
    it('deletes the permission by id', async () => {
      mockCtx.prisma.userConventionPermissions.delete.mockResolvedValue({
        id: 3,
      } as any);

      const result = await controller.deleteConventionPermission('3');

      expect(result?.id).toBe(3);
      expect(
        mockCtx.prisma.userConventionPermissions.delete,
      ).toHaveBeenCalledWith({ where: { id: 3 } });
    });
  });

  describe('updateConventionPermission', () => {
    it('updates the permission flags by id', async () => {
      mockCtx.prisma.userConventionPermissions.update.mockResolvedValue({
        id: 4,
      } as any);

      const result = await controller.updateConventionPermission('4', {
        admin: true,
        geekGuide: false,
        attendee: true,
      });

      expect(result.id).toBe(4);
      expect(
        mockCtx.prisma.userConventionPermissions.update,
      ).toHaveBeenCalledWith({
        where: { id: 4 },
        data: { admin: true, geekGuide: false, attendee: true },
      });
    });
  });

  describe('createPermission', () => {
    it('should create a permission', async () => {
      const permission = {
        id: 1,
        userId: 1,
        conventionId: 1,
        admin: true,
        geekGuide: false,
        attendee: false,
      };

      mockCtx.prisma.userConventionPermissions.create.mockResolvedValue(
        permission,
      );

      const p = await controller.createConventionPermission({
        userId: 1,
        conventionId: 1,
        admin: true,
        geekGuide: false,
        attendee: false,
      });

      expect(p.id).toBe(1);
    });
  });

  describe('addUser', () => {
    it('adds a permission for an existing user without creating one', async () => {
      mockCtx.prisma.user.findUnique.mockResolvedValue({
        id: 7,
        email: 'existing@example.com',
      } as any);
      mockCtx.prisma.userConventionPermissions.create.mockResolvedValue({
        id: 99,
      } as any);

      const result = await controller.addUser('3', {
        email: 'existing@example.com',
        admin: true,
        geekGuide: false,
        attendee: true,
      });

      expect(result?.id).toBe(99);
      expect(mockCtx.prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'existing@example.com' },
      });
      expect(mockCtx.prisma.user.create).not.toHaveBeenCalled();
      expect(
        mockCtx.prisma.userConventionPermissions.create,
      ).toHaveBeenCalledWith({
        data: {
          userId: 7,
          conventionId: 3,
          admin: true,
          geekGuide: false,
          attendee: true,
        },
      });
    });

    it('creates the user first when none exists for the email', async () => {
      mockCtx.prisma.user.findUnique.mockResolvedValue(null as any);
      mockCtx.prisma.user.create.mockResolvedValue({
        id: 12,
        email: 'new@example.com',
      } as any);
      mockCtx.prisma.userConventionPermissions.create.mockResolvedValue({
        id: 100,
      } as any);

      const result = await controller.addUser('3', {
        email: 'new@example.com',
        admin: false,
        geekGuide: true,
        attendee: false,
      });

      expect(result?.id).toBe(100);
      expect(mockCtx.prisma.user.create).toHaveBeenCalledWith({
        data: { email: 'new@example.com' },
      });
      expect(
        mockCtx.prisma.userConventionPermissions.create,
      ).toHaveBeenCalledWith({
        data: {
          userId: 12,
          conventionId: 3,
          admin: false,
          geekGuide: true,
          attendee: false,
        },
      });
    });

    it('rejects when the permission cannot be created', async () => {
      mockCtx.prisma.user.findUnique.mockResolvedValue({ id: 7 } as any);
      mockCtx.prisma.userConventionPermissions.create.mockRejectedValue(
        new Error('db error'),
      );

      await expect(
        controller.addUser('3', {
          email: 'existing@example.com',
          admin: true,
          geekGuide: false,
          attendee: true,
        }),
      ).rejects.toThrow('db error');
    });
  });
});
