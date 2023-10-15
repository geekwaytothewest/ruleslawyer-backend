import { Test } from '@nestjs/testing';
import { AttendeeModule } from './attendee.module';

describe('AttendeeModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [AttendeeModule],
    }).compile();

    expect(module).toBeDefined();
  });
});
