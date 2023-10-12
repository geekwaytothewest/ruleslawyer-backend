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
    it('should return an attendee', async () => {
      mockCtx.prisma.attendee.create.mockResolvedValue({
        id: 1,
        conventionId: 1,
        name: 'Test Attendee',
        userId: null,
        badgeNumber: '1',
        badgeTypeId: 1,
        tteBadgeNumber: 1,
        email: 'test@geekway.com',
        pronounsId: 1,
        checkedIn: false,
        printed: false,
        registrationCode: 'asdf',
      });

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

      expect(attendee.id).toBe(1);
    });
  });

  describe('truncate', () => {
    it('should return', async () => {
      service.truncate(1, ctx);
    });
  });
});
