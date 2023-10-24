import { Test, TestingModule } from '@nestjs/testing';
import { AttendeeService } from './attendee.service';
import { MockContext, Context, createMockContext } from '../prisma/context';
import { AttendeeModule } from '../../modules/attendee/attendee.module';

describe('AttendeeService', () => {
  let service: AttendeeService;
  let mockCtx: MockContext;
  let ctx: Context;

  beforeEach(async () => {
    mockCtx = createMockContext();
    ctx = mockCtx as unknown as Context;
    const module: TestingModule = await Test.createTestingModule({
      imports: [AttendeeModule],
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
        barcode: '*000001*',
      });

      const attendee = await service.createAttendee(
        {
          name: 'Test Attendee',
          badgeNumber: '1',
          barcode: '*000001*',
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

  describe('attendee', () => {
    it('should return an attendee', async () => {
      mockCtx.prisma.attendee.findUnique.mockResolvedValue({
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
        barcode: '*000001*',
      });

      expect(service.attendee({ id: 1 }, ctx)).resolves.toBeTruthy();
    });
  });
});
