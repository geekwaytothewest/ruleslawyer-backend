import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PermissionsController } from './permissions.controller';
import { PermissionsModule } from '../../modules/permissions/permissions.module';
import {
  Context,
  MockContext,
  createMockContext,
} from '../../services/prisma/context';

describe('PermissionsController', () => {
  let controller: PermissionsController;
  let mockCtx: MockContext;
  let ctx: Context;

  beforeEach(async () => {
    mockCtx = createMockContext();
    ctx = mockCtx as unknown as Context;
    const module: TestingModule = await Test.createTestingModule({
      imports: [PermissionsModule],
    }).compile();

    controller = module.get<PermissionsController>(PermissionsController);
    controller.ctx = ctx;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPermissions', () => {
    it('rejects with NotFoundException when the user does not exist', async () => {
      mockCtx.prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        controller.getPermissions('5', { id: 5, superAdmin: false }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('looks the user up by email when the id is non-numeric', async () => {
      mockCtx.prisma.user.findUnique.mockResolvedValue({
        id: 5,
        email: 'a@b.com',
        name: 'A B',
        username: 'ab',
        superAdmin: false,
        pronounsId: 1,
      } as any);
      mockCtx.prisma.userOrganizationPermissions.findMany.mockResolvedValue([]);
      mockCtx.prisma.organization.findMany.mockResolvedValue([]);
      mockCtx.prisma.userConventionPermissions.findMany.mockResolvedValue([]);

      await controller.getPermissions('a@b.com', {
        id: 5,
        superAdmin: false,
      });

      expect(mockCtx.prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'a@b.com' },
      });
    });

    it('returns the sanitized user with merged organization and convention permissions', async () => {
      mockCtx.prisma.user.findUnique.mockResolvedValue({
        id: 5,
        email: 'a@b.com',
        name: 'A B',
        username: 'ab',
        superAdmin: false,
        pronounsId: 1,
        // A field that must NOT be leaked through the response.
        password: 'secret',
      } as any);
      mockCtx.prisma.userOrganizationPermissions.findMany.mockResolvedValue([
        { id: 1, userId: 5, organizationId: 10, admin: true },
      ] as any);
      mockCtx.prisma.organization.findMany.mockResolvedValue([]);
      mockCtx.prisma.userConventionPermissions.findMany.mockResolvedValue([
        { id: 2, userId: 5, conventionId: 99 },
      ] as any);

      const result = await controller.getPermissions('5', {
        id: 5,
        superAdmin: false,
      });

      expect(result.user).toEqual({
        id: 5,
        email: 'a@b.com',
        name: 'A B',
        username: 'ab',
        superAdmin: false,
        pronounsId: 1,
      });
      expect((result.user as any).password).toBeUndefined();
      expect(result.organizations).toHaveLength(1);
      expect(result.conventions).toHaveLength(1);
    });

    it('returns every organization for a super admin viewing their own permissions', async () => {
      mockCtx.prisma.user.findUnique.mockResolvedValue({
        id: 5,
        email: 'a@b.com',
        name: 'A B',
        username: 'ab',
        superAdmin: true,
        pronounsId: 1,
      } as any);
      mockCtx.prisma.organization.findMany.mockResolvedValue([
        { id: 10, name: 'Org A' },
        { id: 20, name: 'Org B' },
      ] as any);
      mockCtx.prisma.userConventionPermissions.findMany.mockResolvedValue([]);

      const result = await controller.getPermissions('5', {
        id: 5,
        superAdmin: true,
      });

      expect(result.organizations).toHaveLength(2);
      expect(result.organizations.every((p) => p.admin === true)).toBe(true);
      // Super admins skip the stored-permission lookup entirely.
      expect(
        mockCtx.prisma.userOrganizationPermissions.findMany,
      ).not.toHaveBeenCalled();
    });
  });
});
