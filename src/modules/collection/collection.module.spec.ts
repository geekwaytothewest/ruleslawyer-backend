import { Test } from '@nestjs/testing';
import { CollectionModule } from './collection.module';

describe('CollectionModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [CollectionModule],
    }).compile();

    expect(module).toBeDefined();
  });
});
