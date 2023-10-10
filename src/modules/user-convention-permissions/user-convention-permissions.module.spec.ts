import { Test } from '@nestjs/testing';
import { UserConventionPermissionsModule } from './user-convention-permissions.module';

describe('UserConventionPermissionsModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [UserConventionPermissionsModule],
    }).compile();

    expect(module).toBeDefined();
  });
});
