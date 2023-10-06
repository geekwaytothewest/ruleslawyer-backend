import { Test, TestingModule } from '@nestjs/testing';
import { UserConventionPermissionsController } from './user-convention-permissions.controller';
import { ConventionService } from '../../services/convention/convention.service';
import { OrganizationService } from '../../services/organization/organization.service';
import { AttendeeService } from '../../services/attendee/attendee.service';
import { TabletopeventsService } from '../../services/tabletopevents/tabletopevents.service';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from '../../services/prisma/prisma.service';
import { UserConventionPermissionsService } from '../../services/user-convention-permissions/user-convention-permissions.service';
import {
  Context,
  MockContext,
  createMockContext,
} from '../../services/prisma/context';

describe('UserConventionPermissionsController', () => {
  let controller: UserConventionPermissionsController;
  let mockCtx: MockContext;
  let ctx: Context;

  beforeEach(async () => {
    mockCtx = createMockContext();
    ctx = mockCtx as unknown as Context;
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      controllers: [UserConventionPermissionsController],
      providers: [
        ConventionService,
        OrganizationService,
        AttendeeService,
        TabletopeventsService,
        PrismaService,
        UserConventionPermissionsService,
      ],
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
