import { Test, TestingModule } from '@nestjs/testing';
import { TabletopeventsService } from './tabletopevents.service';
import { HttpModule } from '@nestjs/axios';

describe('TabletopeventsService', () => {
  let service: TabletopeventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [TabletopeventsService],
    }).compile();

    service = module.get<TabletopeventsService>(TabletopeventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
