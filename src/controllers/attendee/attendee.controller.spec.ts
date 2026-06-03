import { Test, TestingModule } from '@nestjs/testing';
import { AttendeeController } from './attendee.controller';
import { AttendeeModule } from '../../modules/attendee/attendee.module';
import { JwtAuthGuard } from '../../guards/auth/auth.guard';
import { AttendeeGuard } from '../../guards/attendee/attendee.guard';
import {
  Context,
  MockContext,
  createMockContext,
} from '../../services/prisma/context';

describe('AttendeeController', () => {
  let controller: AttendeeController;
  let mockCtx: MockContext;
  let ctx: Context;

  const attendee = {
    id: 5,
    conventionId: 1,
    badgeFirstName: 'Ada',
    badgeLastName: 'Lovelace',
  } as any;

  beforeEach(async () => {
    mockCtx = createMockContext();
    ctx = mockCtx as unknown as Context;
    const module: TestingModule = await Test.createTestingModule({
      imports: [AttendeeModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AttendeeGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AttendeeController>(AttendeeController);
    controller.ctx = ctx;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAttendeeById', () => {
    it('returns the attendee, looking it up by numeric id', async () => {
      mockCtx.prisma.attendee.findUnique.mockResolvedValue(attendee);

      const result = await controller.getAttendeeById('5');

      expect(result).toBe(attendee);
      expect(mockCtx.prisma.attendee.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 5 } }),
      );
    });

    it('returns null when the attendee does not exist', async () => {
      mockCtx.prisma.attendee.findUnique.mockResolvedValue(null);

      await expect(controller.getAttendeeById('5')).resolves.toBeNull();
    });
  });

  describe('updateAttendee', () => {
    it('updates the attendee by numeric id with the request body', async () => {
      const data = { badgeFirstName: 'Grace' };
      const updated = { ...attendee, ...data };
      mockCtx.prisma.attendee.update.mockResolvedValue(updated);

      const result = await controller.updateAttendee('5', data);

      expect(result).toBe(updated);
      expect(mockCtx.prisma.attendee.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data,
      });
    });

    it('rejects when the update fails', async () => {
      mockCtx.prisma.attendee.update.mockRejectedValue(new Error('boom'));

      await expect(
        controller.updateAttendee('5', { badgeFirstName: 'Grace' }),
      ).rejects.toThrow('boom');
    });
  });
});
