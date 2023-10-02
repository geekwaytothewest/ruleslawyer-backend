import { Test, TestingModule } from '@nestjs/testing';
import { UserOrganizationPermissionsService } from './user-organization-permissions.service';

describe('UserOrganizationPermissionsService', () => {
  let service: UserOrganizationPermissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserOrganizationPermissionsService],
    }).compile();

    service = module.get<UserOrganizationPermissionsService>(UserOrganizationPermissionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
