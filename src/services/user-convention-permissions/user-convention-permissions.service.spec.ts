import { Test, TestingModule } from '@nestjs/testing';
import { UserConventionPermissionsService } from './user-convention-permissions.service';
import { UserConventionPermissionsModule } from '../../modules/user-convention-permissions/user-convention-permissions.module';
import { Context, MockContext, createMockContext } from '../prisma/context';

describe('UserConventionPermissionsService', () => {
  let service: UserConventionPermissionsService;
  let mockCtx: MockContext;
  let ctx: Context;

  beforeEach(async () => {
    mockCtx = createMockContext();
    ctx = mockCtx as unknown as Context;
    const module: TestingModule = await Test.createTestingModule({
      imports: [UserConventionPermissionsModule],
    }).compile();

    service = module.get<UserConventionPermissionsService>(
      UserConventionPermissionsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('userConventionPermissions', () => {
    it('should return permissions for the user', async () => {
      mockCtx.prisma.userConventionPermissions.findMany.mockResolvedValue([
        { id: 1 },
      ] as any);

      const result = await service.userConventionPermissions('1', ctx);

      expect(result.length).toBe(1);
      expect(
        mockCtx.prisma.userConventionPermissions.findMany,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 1 },
          include: { convention: true },
        }),
      );
    });
  });

  describe('userConventionCount', () => {
    it('should return the count for a numeric user id', async () => {
      mockCtx.prisma.userConventionPermissions.count.mockResolvedValue(2);

      expect(await service.userConventionCount('1', ctx)).toBe(2);
      expect(
        mockCtx.prisma.userConventionPermissions.count,
      ).toHaveBeenCalledWith({ where: { userId: 1 } });
    });

    it('should resolve an email to a user id first', async () => {
      mockCtx.prisma.user.findUnique.mockResolvedValue({ id: 9 } as any);
      mockCtx.prisma.userConventionPermissions.count.mockResolvedValue(1);

      expect(await service.userConventionCount('a@b.com', ctx)).toBe(1);
      expect(
        mockCtx.prisma.userConventionPermissions.count,
      ).toHaveBeenCalledWith({ where: { userId: 9 } });
    });
  });

  describe('createPermission', () => {
    it('should create a permission', async () => {
      mockCtx.prisma.userConventionPermissions.create.mockResolvedValue({
        id: 1,
      } as any);

      const result = await service.createPermission(
        {
          admin: true,
          user: { connect: { id: 1 } },
          convention: { connect: { id: 1 } },
        } as any,
        ctx,
      );

      expect(result.id).toBe(1);
    });
  });

  describe('getPermissionsBySearch', () => {
    it('should return matching permissions for the search criteria', async () => {
      mockCtx.prisma.userConventionPermissions.findMany.mockResolvedValue([
        { id: 1 },
      ] as any);

      const result = await service.getPermissionsBySearch({ id: 1 }, ctx);

      expect(result.length).toBe(1);
      expect(result[0].id).toBe(1);
      expect(
        mockCtx.prisma.userConventionPermissions.findMany,
      ).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { user: true },
      });
    });

    it('should reject when findMany fails', async () => {
      mockCtx.prisma.userConventionPermissions.findMany.mockRejectedValue(
        new Error('search failed'),
      );

      await expect(
        service.getPermissionsBySearch({ id: 1 }, ctx),
      ).rejects.toThrow('search failed');
    });
  });

  describe('getPermission', () => {
    it('should look up a permission by numeric id', async () => {
      mockCtx.prisma.userConventionPermissions.findUnique.mockResolvedValue({
        id: 7,
      } as any);

      const result = await service.getPermission(7, ctx);

      expect(result?.id).toBe(7);
      expect(
        mockCtx.prisma.userConventionPermissions.findUnique,
      ).toHaveBeenCalledWith({ where: { id: 7 } });
    });

    it('should reject when the lookup fails', async () => {
      mockCtx.prisma.userConventionPermissions.findUnique.mockRejectedValue(
        new Error('db down'),
      );

      await expect(service.getPermission(7, ctx)).rejects.toThrow('db down');
    });
  });

  describe('deletePermission', () => {
    it('should delete a permission by numeric id', async () => {
      mockCtx.prisma.userConventionPermissions.delete.mockResolvedValue({
        id: 3,
      } as any);

      const result = await service.deletePermission(3, ctx);

      expect(result?.id).toBe(3);
      expect(
        mockCtx.prisma.userConventionPermissions.delete,
      ).toHaveBeenCalledWith({ where: { id: 3 } });
    });

    it('should reject when the delete fails', async () => {
      mockCtx.prisma.userConventionPermissions.delete.mockRejectedValue(
        new Error('not found'),
      );

      await expect(service.deletePermission(3, ctx)).rejects.toThrow(
        'not found',
      );
    });
  });

  describe('updatePermission', () => {
    it('should update a permission by numeric id', async () => {
      mockCtx.prisma.userConventionPermissions.update.mockResolvedValue({
        id: 4,
        admin: false,
      } as any);

      const result = await service.updatePermission(4, { admin: false }, ctx);

      expect(result.id).toBe(4);
      expect(
        mockCtx.prisma.userConventionPermissions.update,
      ).toHaveBeenCalledWith({ where: { id: 4 }, data: { admin: false } });
    });

    it('should reject when the update fails', async () => {
      mockCtx.prisma.userConventionPermissions.update.mockRejectedValue(
        new Error('conflict'),
      );

      await expect(
        service.updatePermission(4, { admin: false }, ctx),
      ).rejects.toThrow('conflict');
    });
  });

  describe('error handling', () => {
    it('userConventionPermissions rejects when findMany fails', async () => {
      mockCtx.prisma.userConventionPermissions.findMany.mockRejectedValue(
        new Error('boom'),
      );

      await expect(service.userConventionPermissions('1', ctx)).rejects.toThrow(
        'boom',
      );
    });

    it('createPermission rejects when create fails', async () => {
      mockCtx.prisma.userConventionPermissions.create.mockRejectedValue(
        new Error('bad data'),
      );

      await expect(
        service.createPermission({} as any, ctx),
      ).rejects.toThrow('bad data');
    });
  });

  describe('resolveConventions', () => {
    const DAY = 24 * 60 * 60 * 1000;

    // A convention relative to "now", overridable per case.
    function con(over: Record<string, unknown> = {}) {
      const now = Date.now();
      return {
        id: 1,
        organizationId: 7,
        name: 'Geekway',
        annual: '1st Annual',
        cancelled: false,
        startDate: new Date(now - DAY),
        endDate: new Date(now + DAY),
        ...over,
      };
    }

    function mockPerms(conventions: (ReturnType<typeof con> | null)[]) {
      mockCtx.prisma.userConventionPermissions.findMany.mockResolvedValue(
        conventions.map((convention) => ({ convention })) as never,
      );
    }

    it('picks an in-progress convention as current', async () => {
      mockPerms([con({ id: 10 })]);

      const result = await service.resolveConventions(2, ctx);

      expect(result.current).toEqual({ organizationId: 7, conventionId: 10 });
      expect(result.conventions).toHaveLength(1);
    });

    it('prefers the most recently started among several active conventions', async () => {
      const now = Date.now();
      mockPerms([
        con({ id: 1, startDate: new Date(now - 10 * DAY), endDate: new Date(now + DAY) }),
        con({ id: 2, startDate: new Date(now - 2 * DAY), endDate: new Date(now + DAY) }),
      ]);

      const result = await service.resolveConventions(2, ctx);

      expect(result.current?.conventionId).toBe(2);
    });

    it('falls back to the soonest upcoming convention when none are active', async () => {
      const now = Date.now();
      mockPerms([
        con({ id: 3, startDate: new Date(now + 2 * DAY), endDate: new Date(now + 5 * DAY) }),
        con({ id: 4, startDate: new Date(now + 10 * DAY), endDate: new Date(now + 15 * DAY) }),
      ]);

      const result = await service.resolveConventions(2, ctx);

      expect(result.current?.conventionId).toBe(3);
    });

    it('returns no current convention when all are ended or cancelled', async () => {
      const now = Date.now();
      mockPerms([
        con({ id: 5, startDate: new Date(now - 10 * DAY), endDate: new Date(now - DAY) }),
        con({ id: 6, cancelled: true }),
      ]);

      const result = await service.resolveConventions(2, ctx);

      expect(result.current).toBeNull();
      // The picker list still carries every convention the user belongs to.
      expect(result.conventions).toHaveLength(2);
    });

    it('picks the most recently started active convention regardless of input order', async () => {
      const now = Date.now();
      mockPerms([
        con({ id: 2, startDate: new Date(now - 2 * DAY), endDate: new Date(now + DAY) }),
        con({ id: 1, startDate: new Date(now - 10 * DAY), endDate: new Date(now + DAY) }),
      ]);

      const result = await service.resolveConventions(2, ctx);

      expect(result.current?.conventionId).toBe(2);
    });

    it('picks the soonest upcoming convention regardless of input order', async () => {
      const now = Date.now();
      mockPerms([
        con({ id: 4, startDate: new Date(now + 10 * DAY), endDate: new Date(now + 15 * DAY) }),
        con({ id: 3, startDate: new Date(now + 2 * DAY), endDate: new Date(now + 5 * DAY) }),
      ]);

      const result = await service.resolveConventions(2, ctx);

      expect(result.current?.conventionId).toBe(3);
    });

    it('drops permissions whose convention relation is missing', async () => {
      mockPerms([null, con({ id: 7 })]);

      const result = await service.resolveConventions(2, ctx);

      expect(result.conventions).toHaveLength(1);
      expect(result.conventions[0].conventionId).toBe(7);
    });
  });
});
