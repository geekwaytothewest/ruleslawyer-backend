import { Test, TestingModule } from '@nestjs/testing';
import { UserOrganizationPermissionsController } from './user-organization-permissions.controller';
import { OrganizationService } from '../../services/organization/organization.service';
import { PrismaService } from '../../services/prisma/prisma.service';
import { UserOrganizationPermissionsService } from '../../services/user-organization-permissions/user-organization-permissions.service';

describe('UserOrganizationPermissionsController', () => {
  let controller: UserOrganizationPermissionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserOrganizationPermissionsController],
      providers: [
        OrganizationService,
        PrismaService,
        {
          provide: UserOrganizationPermissionsService,
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

    controller = module.get<UserOrganizationPermissionsController>(
      UserOrganizationPermissionsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createPermission', () => {
    it('should create a permission', async () => {
      const perm = await controller.createPermission({
        userId: 1,
        organizationId: 1,
        admin: true,
        geekGuide: false,
        readOnly: false,
      });

      expect(perm.id).toBe(1);
    });
  });
});
