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

      const p = await controller.createPermission({
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
