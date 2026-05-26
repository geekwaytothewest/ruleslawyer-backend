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

  describe('getPermission', () => {
    it('should return a permission by unique key', async () => {
      mockCtx.prisma.userConventionPermissions.findUnique.mockResolvedValue({
        id: 1,
      } as any);

      const result = await service.getPermission({ id: 1 }, ctx);

      expect(result?.id).toBe(1);
    });
  });
});
