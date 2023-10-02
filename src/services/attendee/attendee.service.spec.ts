import { Test, TestingModule } from '@nestjs/testing';
import { AttendeeService } from './attendee.service';

describe('AttendeeService', () => {
  let service: AttendeeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AttendeeService],
    }).compile();

    service = module.get<AttendeeService>(AttendeeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
