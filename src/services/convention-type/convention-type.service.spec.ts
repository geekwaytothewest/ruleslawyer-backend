import { Test, TestingModule } from '@nestjs/testing';
import { ConventionTypeService } from './convention-type.service';

describe('ConventionTypeService', () => {
  let service: ConventionTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConventionTypeService],
    }).compile();

    service = module.get<ConventionTypeService>(ConventionTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
