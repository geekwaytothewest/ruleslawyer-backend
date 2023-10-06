import { Test, TestingModule } from '@nestjs/testing';
import { UserConventionPermissionsController } from './user-convention-permissions.controller';
import { ConventionService } from '../../services/convention/convention.service';
import { OrganizationService } from '../../services/organization/organization.service';
import { AttendeeService } from '../../services/attendee/attendee.service';
import { TabletopeventsService } from '../../services/tabletopevents/tabletopevents.service';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from '../../services/prisma/prisma.service';
import { UserConventionPermissionsService } from '../../services/user-convention-permissions/user-convention-permissions.service';

describe('UserConventionPermissionsController', () => {
  let controller: UserConventionPermissionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      controllers: [UserConventionPermissionsController],
      providers: [
        ConventionService,
        OrganizationService,
        AttendeeService,
        TabletopeventsService,
        PrismaService,
        {
          provide: UserConventionPermissionsService,
          useValue: {
            createPermission: jest.fn().mockImplementation(
              () =>
                <unknown>{
                  id: 1,
                },
            ),
          },
        },
      ],
    }).compile();

    controller = module.get<UserConventionPermissionsController>(
      UserConventionPermissionsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createPermission', () => {
    it('should create a permission', async () => {
      const perm = await controller.createPermission({
        userId: 1,
        conventionId: 1,
        admin: true,
        geekGuide: false,
        attendee: false,
      });

      expect(perm.id).toBe(1);
    });
  });
});
