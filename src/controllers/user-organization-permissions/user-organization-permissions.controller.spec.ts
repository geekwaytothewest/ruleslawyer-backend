import { Test, TestingModule } from '@nestjs/testing';
import { UserOrganizationPermissionsController } from './user-organization-permissions.controller';
import {
  Context,
  MockContext,
  createMockContext,
} from '../../services/prisma/context';
import { UserOrganizationPermissionsModule } from '../../modules/user-organization-permissions/user-organization-permissions.module';

describe('UserOrganizationPermissionsController', () => {
  let controller: UserOrganizationPermissionsController;
  let mockCtx: MockContext;
  let ctx: Context;

  beforeEach(async () => {
    mockCtx = createMockContext();
    ctx = mockCtx as unknown as Context;
    const module: TestingModule = await Test.createTestingModule({
      imports: [UserOrganizationPermissionsModule],
    }).compile();

    controller = module.get<UserOrganizationPermissionsController>(
      UserOrganizationPermissionsController,
    );
    controller.ctx = ctx;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserOrganizationPermissions', () => {
    it('returns every organization as an admin permission for a super admin', async () => {
      mockCtx.prisma.organization.findMany.mockResolvedValue([
        { id: 10, name: 'Org A' },
        { id: 20, name: 'Org B' },
      ] as any);

      const result = await controller.getUserOrganizationPermissions('5', {
        id: 5,
        superAdmin: true,
      });

      expect(result).toHaveLength(2);
      expect(result.every((p) => p.admin === true)).toBe(true);
      expect(result[0].organizationId).toBe(10);
      // Super admins skip the stored-permission lookup entirely.
      expect(
        mockCtx.prisma.userOrganizationPermissions.findMany,
      ).not.toHaveBeenCalled();
    });

    it('marks owned orgs admin and synthesizes a permission for orgs without one', async () => {
      // Stored permission for org 10 only; user owns orgs 10 and 20.
      mockCtx.prisma.userOrganizationPermissions.findMany.mockResolvedValue([
        { id: 1, userId: 5, organizationId: 10, admin: false },
      ] as any);
      mockCtx.prisma.organization.findMany.mockResolvedValue([
        { id: 10, name: 'Org A' },
        { id: 20, name: 'Org B' },
      ] as any);

      const result = await controller.getUserOrganizationPermissions('5', {
        superAdmin: false,
      });

      expect(result).toHaveLength(2);

      const existing = result.find((p) => p.organizationId === 10)!;
      expect(existing.admin).toBe(true);
      expect(existing.id).toBe(1);

      const synthesized: any = result.find((p) => p.organizationId === 20)!;
      expect(synthesized.id).toBe(-1);
      expect(synthesized.admin).toBe(true);
      expect(synthesized.organization).toEqual({ id: 20, name: 'Org B' });
    });
  });

  describe('getUserConventionCount', () => {
    it('returns the organization permission count for the user', async () => {
      mockCtx.prisma.userOrganizationPermissions.count.mockResolvedValue(
        3 as any,
      );

      const result = await controller.getUserConventionCount('5');

      expect(result).toBe(3);
      expect(
        mockCtx.prisma.userOrganizationPermissions.count,
      ).toHaveBeenCalledWith({ where: { userId: 5 } });
    });
  });

  describe('getOrganizationUsers', () => {
    it('returns the permissions for an organization', async () => {
      mockCtx.prisma.userOrganizationPermissions.findMany.mockResolvedValue([
        { id: 1, organizationId: 10 },
        { id: 2, organizationId: 10 },
      ] as any);

      const result = await controller.getOrganizationUsers('10');

      expect(result).toHaveLength(2);
      expect(
        mockCtx.prisma.userOrganizationPermissions.findMany,
      ).toHaveBeenCalledWith({
        where: { organizationId: 10 },
        include: { user: true },
      });
    });

    it('returns an empty array when no permissions exist', async () => {
      mockCtx.prisma.userOrganizationPermissions.findMany.mockResolvedValue(
        null as any,
      );

      const result = await controller.getOrganizationUsers('10');

      expect(result).toEqual([]);
    });
  });

  describe('deleteOrganizationPermission', () => {
    it('deletes the permission by id', async () => {
      mockCtx.prisma.userOrganizationPermissions.delete.mockResolvedValue({
        id: 3,
      } as any);

      const result = await controller.deleteOrganizationPermission('3');

      expect(result?.id).toBe(3);
      expect(
        mockCtx.prisma.userOrganizationPermissions.delete,
      ).toHaveBeenCalledWith({ where: { id: 3 } });
    });
  });

  describe('updateOrganizationPermission', () => {
    it('updates the permission flags by id', async () => {
      mockCtx.prisma.userOrganizationPermissions.update.mockResolvedValue({
        id: 4,
      } as any);

      const result = await controller.updateOrganizationPermission('4', {
        admin: true,
        geekGuide: false,
        readOnly: true,
      });

      expect(result.id).toBe(4);
      expect(
        mockCtx.prisma.userOrganizationPermissions.update,
      ).toHaveBeenCalledWith({
        where: { id: 4 },
        data: { admin: true, geekGuide: false, readOnly: true },
      });
    });
  });

  describe('createPermission', () => {
    it('should create a permission', async () => {
      const permission = {
        id: 1,
        userId: 1,
        organizationId: 1,
        admin: true,
        geekGuide: false,
        readOnly: false,
      };

      mockCtx.prisma.userOrganizationPermissions.create.mockResolvedValue(
        permission,
      );

      const p = await controller.createPermission({
        userId: 1,
        organizationId: 1,
        admin: true,
        geekGuide: false,
        readOnly: false,
      });

      expect(p.id).toBe(1);
    });
  });
});
