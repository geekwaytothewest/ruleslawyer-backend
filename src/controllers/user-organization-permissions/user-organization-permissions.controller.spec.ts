import { Test, TestingModule } from '@nestjs/testing';
import { UserOrganizationPermissionsController } from './user-organization-permissions.controller';
import { OrganizationService } from '../../services/organization/organization.service';
import { PrismaService } from '../../services/prisma/prisma.service';
import { UserOrganizationPermissionsService } from '../../services/user-organization-permissions/user-organization-permissions.service';
import {
  Context,
  MockContext,
  createMockContext,
} from '../../services/prisma/context';

describe('UserOrganizationPermissionsController', () => {
  let controller: UserOrganizationPermissionsController;
  let mockCtx: MockContext;
  let ctx: Context;

  beforeEach(async () => {
    mockCtx = createMockContext();
    ctx = mockCtx as unknown as Context;
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserOrganizationPermissionsController],
      providers: [
        OrganizationService,
        PrismaService,
        UserOrganizationPermissionsService,
      ],
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
