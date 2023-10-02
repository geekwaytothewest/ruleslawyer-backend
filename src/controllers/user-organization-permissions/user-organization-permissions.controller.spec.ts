import { Test, TestingModule } from '@nestjs/testing';
import { UserOrganizationPermissionsController } from './user-organization-permissions.controller';

describe('UserOrganizationPermissionsController', () => {
  let controller: UserOrganizationPermissionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserOrganizationPermissionsController],
    }).compile();

    controller = module.get<UserOrganizationPermissionsController>(
      UserOrganizationPermissionsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
