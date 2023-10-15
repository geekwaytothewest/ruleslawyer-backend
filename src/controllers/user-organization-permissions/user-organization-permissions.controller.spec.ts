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
