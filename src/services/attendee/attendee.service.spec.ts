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
        badgeName: 'asdf',
        badgeFirstName: 'asdf',
        badgeLastName: 'asdf',
        legalName: 'asdf',
        merch: null,
        userId: null,
        badgeNumber: '1',
        badgeTypeId: 1,
        tteBadgeNumber: 1,
        tteBadgeId: 'xxx',
        email: 'test@geekway.com',
        pronounsId: 1,
        checkedIn: false,
        printed: false,
        registrationCode: 'asdf',
        barcode: '*000001*',
        eligibleForPrizes: true,
        lostBadge: false,
      });

      const attendee = await service.createAttendee(
        {
          badgeName: 'asdf',
          badgeFirstName: 'asdf',
          badgeLastName: 'asdf',
          legalName: 'asdf',
          merch: null,
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

  describe('attendee', () => {
    it('should return an attendee', async () => {
      mockCtx.prisma.attendee.findUnique.mockResolvedValue({
        id: 1,
        conventionId: 1,
        badgeName: 'asdf',
        badgeFirstName: 'asdf',
        badgeLastName: 'asdf',
        legalName: 'asdf',
        merch: null,
        userId: null,
        badgeNumber: '1',
        badgeTypeId: 1,
        tteBadgeNumber: 1,
        tteBadgeId: 'xxx',
        email: 'test@geekway.com',
        pronounsId: 1,
        checkedIn: false,
        printed: false,
        registrationCode: 'asdf',
        barcode: '*000001*',
        eligibleForPrizes: true,
        lostBadge: false,
      });

      expect(service.attendee({ id: 1 }, ctx)).resolves.toBeTruthy();
    });
  });

  describe('attendees', () => {
    it('should return attendees', async () => {
      mockCtx.prisma.attendee.findMany.mockResolvedValue([
        {
          id: 1,
          conventionId: 1,
          badgeName: 'asdf',
          badgeFirstName: 'asdf',
          badgeLastName: 'asdf',
          legalName: 'asdf',
          userId: null,
          badgeNumber: '1',
          badgeTypeId: 1,
          tteBadgeNumber: 1,
          tteBadgeId: 'xxx',
          email: 'test@geekway.com',
          pronounsId: 1,
          checkedIn: false,
          printed: false,
          registrationCode: 'asdf',
          barcode: '*000001*',
          merch: null,
          eligibleForPrizes: true,
          lostBadge: false,
        },
      ]);

      const attendees = await service.attendees(1, ctx);

      expect(attendees.length).toBe(1);
    });
  });

  describe('updateAttendee', () => {
    it('should update an attendee', async () => {
      mockCtx.prisma.attendee.update.mockResolvedValue({
        id: 1,
        conventionId: 1,
        badgeName: 'asdf',
        badgeFirstName: 'asdf',
        badgeLastName: 'asdf',
        legalName: 'asdf',
        userId: null,
        badgeNumber: '1',
        badgeTypeId: 1,
        tteBadgeNumber: 1,
        tteBadgeId: 'xxx',
        email: 'test@geekway.com',
        pronounsId: 1,
        checkedIn: false,
        printed: false,
        registrationCode: 'asdf',
        barcode: '*000001*',
        merch: null,
        eligibleForPrizes: true,
        lostBadge: false,
      });

      const attendee = await service.updateAttendee(
        {
          where: { id: 1 },
          data: { badgeName: 'asdf' },
        },
        ctx,
      );

      expect(attendee.badgeName).toBe('asdf');
    });
  });

  describe('syncAttendee', () => {
    it('should upsert an attendee', async () => {
      mockCtx.prisma.attendee.upsert.mockResolvedValue({ id: 1 } as any);

      const attendee = await service.syncAttendee(
        {
          badgeName: 'asdf',
          badgeFirstName: 'asdf',
          badgeLastName: 'asdf',
          legalName: 'asdf',
          badgeNumber: '1',
          barcode: '*000001*',
          tteBadgeNumber: 1,
          convention: { connect: { id: 1 } },
        },
        ctx,
      );

      expect(attendee.id).toBe(1);
      expect(mockCtx.prisma.attendee.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            conventionId_tteBadgeNumber: {
              conventionId: 1,
              tteBadgeNumber: 1,
            },
          },
        }),
      );
    });
  });

  describe('attendeeWithCheckouts', () => {
    it('should return an attendee with its checkouts', async () => {
      mockCtx.prisma.attendee.findUnique.mockResolvedValue({
        id: 1,
        checkOuts: [],
      } as any);

      const attendee = await service.attendeeWithCheckouts({ id: 1 }, ctx);

      expect(attendee?.id).toBe(1);
      expect(mockCtx.prisma.attendee.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ include: { checkOuts: true } }),
      );
    });
  });

  describe('attendeesWithPronounsAndBadgeTypes', () => {
    it('should return attendees including pronouns and badge types', async () => {
      mockCtx.prisma.attendee.findMany.mockResolvedValue([{ id: 1 }] as any);

      const attendees = await service.attendeesWithPronounsAndBadgeTypes(1, ctx);

      expect(attendees.length).toBe(1);
      expect(mockCtx.prisma.attendee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { conventionId: 1 },
          include: { pronouns: true, badgeType: true },
        }),
      );
    });
  });

  describe('badgeTransfer', () => {
    it('should update the badge with the new attendee info', async () => {
      mockCtx.prisma.attendee.update.mockResolvedValue({
        id: 1,
        badgeFirstName: 'New',
        badgeLastName: 'Owner',
      } as any);

      const attendee = await service.badgeTransfer(
        1,
        {
          fromBadgeNumber: '1',
          newBadgeFirstName: 'New',
          newBadgeLastName: 'Owner',
          newBadgePronouns: 'they/them',
        },
        ctx,
      );

      expect(attendee.badgeFirstName).toBe('New');
      expect(mockCtx.prisma.attendee.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            conventionId_badgeNumber: {
              conventionId: 1,
              badgeNumber: '1',
            },
          },
        }),
      );
    });

    it('should default pronouns when none are provided', async () => {
      mockCtx.prisma.attendee.update.mockResolvedValue({ id: 1 } as any);

      await service.badgeTransfer(
        1,
        {
          fromBadgeNumber: '1',
          newBadgeFirstName: 'New',
          newBadgeLastName: 'Owner',
          newBadgePronouns: '',
        },
        ctx,
      );

      const call = mockCtx.prisma.attendee.update.mock.calls[0][0] as any;
      expect(call.data.pronouns.connectOrCreate.create.pronouns).toBe(
        'Prefer Not To Say',
      );
    });
  });

  describe('badgeReplacement', () => {
    const oldBadge = {
      id: 1,
      badgeFirstName: 'Real',
      badgeLastName: 'Attendee',
      legalName: 'Real Attendee',
      badgeName: 'Real Attendee',
      pronounsId: 5,
    };

    const blankBadge = {
      id: 2,
      badgeName: 'Attendee Blank 2',
    };

    const runTransaction = () => {
      mockCtx.prisma.$transaction.mockImplementation((cb: any) =>
        cb(mockCtx.prisma),
      );
    };

    it('should move the attendee onto the blank badge', async () => {
      runTransaction();
      mockCtx.prisma.attendee.findUnique
        .mockResolvedValueOnce(oldBadge as any)
        .mockResolvedValueOnce(blankBadge as any);
      mockCtx.prisma.attendee.update.mockResolvedValue({} as any);
      mockCtx.prisma.checkOut.updateMany.mockResolvedValue({ count: 0 } as any);

      await service.badgeReplacement(
        1,
        { fromBadgeNumber: '1', toBadgeNumber: '2' },
        ctx,
      );

      // old badge flagged as lost, new badge updated, checkouts moved
      expect(mockCtx.prisma.attendee.update).toHaveBeenCalledTimes(2);
      expect(mockCtx.prisma.checkOut.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { attendeeId: oldBadge.id },
          data: { attendeeId: blankBadge.id },
        }),
      );
    });

    it('should reject when the old badge is not found', async () => {
      runTransaction();
      mockCtx.prisma.attendee.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(blankBadge as any);

      await expect(
        service.badgeReplacement(
          1,
          { fromBadgeNumber: '1', toBadgeNumber: '2' },
          ctx,
        ),
      ).rejects.toThrow();
    });

    it('should reject when the new badge is not found', async () => {
      runTransaction();
      mockCtx.prisma.attendee.findUnique
        .mockResolvedValueOnce(oldBadge as any)
        .mockResolvedValueOnce(null);

      await expect(
        service.badgeReplacement(
          1,
          { fromBadgeNumber: '1', toBadgeNumber: '2' },
          ctx,
        ),
      ).rejects.toThrow();
    });

    it('should reject when the target badge is not an unassigned blank', async () => {
      runTransaction();
      mockCtx.prisma.attendee.findUnique
        .mockResolvedValueOnce(oldBadge as any)
        .mockResolvedValueOnce({ id: 2, badgeName: 'Someone Real' } as any);

      await expect(
        service.badgeReplacement(
          1,
          { fromBadgeNumber: '1', toBadgeNumber: '2' },
          ctx,
        ),
      ).rejects.toThrow('Badge replacement can only be done to unassigned badges.');
    });
  });
});
