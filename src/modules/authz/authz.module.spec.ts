import { Test } from '@nestjs/testing';
import { AuthzModule } from './authz.module';

describe('AuthzModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [AuthzModule],
    }).compile();

    expect(module).toBeDefined();
  });
});
