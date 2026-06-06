import { Test } from '@nestjs/testing';
import { ConventionTypeModule } from './convention-type.module';

describe('ConventionTypeModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [ConventionTypeModule],
    }).compile();

    expect(module).toBeDefined();
  });
});
