import { Test } from '@nestjs/testing';
import { UserModule } from './user.module';

describe('UserModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      controllers: [UserModule],
    }).compile();

    expect(module).toBeDefined();
  });
});
