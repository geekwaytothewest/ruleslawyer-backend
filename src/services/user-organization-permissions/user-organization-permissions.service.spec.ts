import { Test, TestingModule } from '@nestjs/testing';
import { UserOrganizationPermissionsService } from './user-organization-permissions.service';
import { UserOrganizationPermissionsModule } from '../../modules/user-organization-permissions/user-organization-permissions.module';
import { Context, MockContext, createMockContext } from '../prisma/context';

describe('UserOrganizationPermissionsService', () => {
  let service: UserOrganizationPermissionsService;
  let mockCtx: MockContext;
  let ctx: Context;

  beforeEach(async () => {
    mockCtx = createMockContext();
    ctx = mockCtx as unknown as Context;
    const module: TestingModule = await Test.createTestingModule({
      imports: [UserOrganizationPermissionsModule],
    }).compile();

    service = module.get<UserOrganizationPermissionsService>(
      UserOrganizationPermissionsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('userOrganizationCount', () => {
    it('should return the count for a numeric user id', async () => {
      mockCtx.prisma.userOrganizationPermissions.count.mockResolvedValue(3);

      expect(await service.userOrganizationCount('1', ctx)).toBe(3);
      expect(
        mockCtx.prisma.userOrganizationPermissions.count,
      ).toHaveBeenCalledWith({ where: { userId: 1 } });
    });

    it('should resolve an email to a user id first', async () => {
      mockCtx.prisma.user.findUnique.mockResolvedValue({ id: 7 } as any);
      mockCtx.prisma.userOrganizationPermissions.count.mockResolvedValue(1);

      expect(await service.userOrganizationCount('a@b.com', ctx)).toBe(1);
      expect(
        mockCtx.prisma.userOrganizationPermissions.count,
      ).toHaveBeenCalledWith({ where: { userId: 7 } });
    });
  });

  describe('userOrganizationPermissions', () => {
    it('should return permissions for the user', async () => {
      mockCtx.prisma.userOrganizationPermissions.findMany.mockResolvedValue([
        { id: 1 },
      ] as any);

      const result = await service.userOrganizationPermissions('1', ctx);

      expect(result.length).toBe(1);
      expect(
        mockCtx.prisma.userOrganizationPermissions.findMany,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 1 },
          include: { organization: true, user: true },
        }),
      );
    });
  });

  describe('createPermission', () => {
    it('should create a permission', async () => {
      mockCtx.prisma.userOrganizationPermissions.create.mockResolvedValue({
        id: 1,
      } as any);

      const result = await service.createPermission(
        {
          admin: true,
          user: { connect: { id: 1 } },
          organization: { connect: { id: 1 } },
        } as any,
        ctx,
      );

      expect(result.id).toBe(1);
    });

    it('should reject when the create fails', async () => {
      mockCtx.prisma.userOrganizationPermissions.create.mockRejectedValue(
        new Error('bad data'),
      );

      await expect(service.createPermission({} as any, ctx)).rejects.toThrow(
        'bad data',
      );
    });
  });

  describe('getPermissionsBySearch', () => {
    it('should return matching permissions including the user', async () => {
      mockCtx.prisma.userOrganizationPermissions.findMany.mockResolvedValue([
        { id: 1, organizationId: 10 },
      ] as any);

      const result = await service.getPermissionsBySearch(
        { organizationId: 10 },
        ctx,
      );

      expect(result).toHaveLength(1);
      expect(
        mockCtx.prisma.userOrganizationPermissions.findMany,
      ).toHaveBeenCalledWith({
        where: { organizationId: 10 },
        include: { user: true },
      });
    });

    it('should reject when the lookup fails', async () => {
      mockCtx.prisma.userOrganizationPermissions.findMany.mockRejectedValue(
        new Error('boom'),
      );

      await expect(
        service.getPermissionsBySearch({ organizationId: 10 }, ctx),
      ).rejects.toThrow('boom');
    });
  });

  describe('getPermission', () => {
    it('should look up a permission by numeric id', async () => {
      mockCtx.prisma.userOrganizationPermissions.findUnique.mockResolvedValue({
        id: 7,
      } as any);

      const result = await service.getPermission(7, ctx);

      expect(result?.id).toBe(7);
      expect(
        mockCtx.prisma.userOrganizationPermissions.findUnique,
      ).toHaveBeenCalledWith({ where: { id: 7 } });
    });

    it('should reject when the lookup fails', async () => {
      mockCtx.prisma.userOrganizationPermissions.findUnique.mockRejectedValue(
        new Error('db down'),
      );

      await expect(service.getPermission(7, ctx)).rejects.toThrow('db down');
    });
  });

  describe('deletePermission', () => {
    it('should delete a permission by numeric id', async () => {
      mockCtx.prisma.userOrganizationPermissions.delete.mockResolvedValue({
        id: 3,
      } as any);

      const result = await service.deletePermission(3, ctx);

      expect(result?.id).toBe(3);
      expect(
        mockCtx.prisma.userOrganizationPermissions.delete,
      ).toHaveBeenCalledWith({ where: { id: 3 } });
    });

    it('should reject when the delete fails', async () => {
      mockCtx.prisma.userOrganizationPermissions.delete.mockRejectedValue(
        new Error('not found'),
      );

      await expect(service.deletePermission(3, ctx)).rejects.toThrow(
        'not found',
      );
    });
  });

  describe('updatePermission', () => {
    it('should update a permission by numeric id', async () => {
      mockCtx.prisma.userOrganizationPermissions.update.mockResolvedValue({
        id: 4,
        admin: false,
      } as any);

      const result = await service.updatePermission(4, { admin: false }, ctx);

      expect(result.id).toBe(4);
      expect(
        mockCtx.prisma.userOrganizationPermissions.update,
      ).toHaveBeenCalledWith({ where: { id: 4 }, data: { admin: false } });
    });

    it('should reject when the update fails', async () => {
      mockCtx.prisma.userOrganizationPermissions.update.mockRejectedValue(
        new Error('conflict'),
      );

      await expect(
        service.updatePermission(4, { admin: false }, ctx),
      ).rejects.toThrow('conflict');
    });
  });

  describe('userOrganizationPermissions error handling', () => {
    it('rejects when findMany fails', async () => {
      mockCtx.prisma.userOrganizationPermissions.findMany.mockRejectedValue(
        new Error('boom'),
      );

      await expect(
        service.userOrganizationPermissions('1', ctx),
      ).rejects.toThrow('boom');
    });
  });
});
