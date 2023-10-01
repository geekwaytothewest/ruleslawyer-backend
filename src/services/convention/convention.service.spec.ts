import { Test, TestingModule } from '@nestjs/testing';
import { ConventionService } from './convention.service';

describe('ConventionService', () => {
  let service: ConventionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConventionService],
    }).compile();

    service = module.get<ConventionService>(ConventionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
