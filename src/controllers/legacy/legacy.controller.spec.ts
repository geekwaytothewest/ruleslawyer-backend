import { Test, TestingModule } from '@nestjs/testing';
import { LegacyController } from './legacy.controller';
import { LegacyModule } from '../../modules/legacy/legacy.module';

describe('LegacyController', () => {
  let controller: LegacyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [LegacyModule],
    }).compile();

    controller = module.get<LegacyController>(LegacyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
