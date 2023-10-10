import { Test } from '@nestjs/testing';
import { ConventionModule } from './convention.module';

describe('ConventionModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [ConventionModule],
    }).compile();

    expect(module).toBeDefined();
  });
});
