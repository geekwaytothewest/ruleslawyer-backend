import { Test } from '@nestjs/testing';
import { UserOrganizationPermissionsModule } from './user-organization-permissions.module';

describe('UserOrganizationPermissionsModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [UserOrganizationPermissionsModule],
    }).compile();

    expect(module).toBeDefined();
  });
});
