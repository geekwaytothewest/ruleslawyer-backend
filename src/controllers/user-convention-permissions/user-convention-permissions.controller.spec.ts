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
});
