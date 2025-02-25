import { Test } from '@nestjs/testing';
import { CopyModule } from './copy.module';

describe('CopyModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [CopyModule],
    }).compile();

    expect(module).toBeDefined();
  });
});
