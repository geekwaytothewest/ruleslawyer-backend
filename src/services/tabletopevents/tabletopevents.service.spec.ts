import { Test, TestingModule } from '@nestjs/testing';
import { TabletopeventsService } from './tabletopevents.service';

describe('TabletopeventsService', () => {
  let service: TabletopeventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TabletopeventsService],
    }).compile();

    service = module.get<TabletopeventsService>(TabletopeventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
