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
          include: { organization: true },
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
  });
});
