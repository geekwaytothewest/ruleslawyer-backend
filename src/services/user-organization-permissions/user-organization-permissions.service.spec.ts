import { Test, TestingModule } from '@nestjs/testing';
import { UserOrganizationPermissionsService } from './user-organization-permissions.service';
import { UserOrganizationPermissionsModule } from '../../modules/user-organization-permissions/user-organization-permissions.module';

describe('UserOrganizationPermissionsService', () => {
  let service: UserOrganizationPermissionsService;

  beforeEach(async () => {
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
});
