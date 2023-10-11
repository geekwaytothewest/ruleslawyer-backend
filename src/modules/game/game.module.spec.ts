import { Test } from '@nestjs/testing';
import { GameModule } from './game.module';

describe('GameModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [GameModule],
    }).compile();

    expect(module).toBeDefined();
  });
});
