import { Test } from '@nestjs/testing';
import { LegacyModule } from './legacy.module';

describe('LegacyModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [LegacyModule],
    }).compile();

    expect(module).toBeDefined();
  });
});
