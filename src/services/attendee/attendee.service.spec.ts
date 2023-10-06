import { Test, TestingModule } from '@nestjs/testing';
import { AttendeeService } from './attendee.service';
import { PrismaService } from '../prisma/prisma.service';
import { MockContext, Context, createMockContext } from '../prisma/context';

describe('AttendeeService', () => {
  let service: AttendeeService;
  let mockCtx: MockContext;
  let ctx: Context;

  beforeEach(async () => {
    mockCtx = createMockContext();
    ctx = mockCtx as unknown as Context;
    const module: TestingModule = await Test.createTestingModule({
      providers: [AttendeeService, PrismaService],
    }).compile();

    service = module.get<AttendeeService>(AttendeeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAttendee', () => {
    it('should return true', async () => {
      const attendee = await service.createAttendee(
        {
          name: 'Test Attendee',
          convention: {
            connect: {
              id: 1,
            },
          },
        },
        ctx,
      );

      expect(attendee).toBe(true);
    });
  });

  describe('truncate', () => {
    it('should return', async () => {
      service.truncate(1, ctx);
    });
  });
});
