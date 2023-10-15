import { Test } from '@nestjs/testing';
import { CheckOutModule } from './check-out.module';

describe('CheckOutModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [CheckOutModule],
    }).compile();

    expect(module).toBeDefined();
  });
});
