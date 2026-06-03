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

      // legalName and badgeName are rebuilt from the new first/last name.
      const call = mockCtx.prisma.attendee.update.mock.calls[0][0] as any;
      expect(call.data.legalName).toBe('New Owner');
      expect(call.data.badgeName).toBe('New Owner');

      // The previous holder's account link and email are dropped.
      expect(call.data.email).toBeNull();
      expect(call.data.user).toEqual({ disconnect: true });
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
      userId: 42,
      email: 'real@geekway.com',
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

    it('marks the old badge lost and copies the identity onto the blank badge', async () => {
      runTransaction();
      mockCtx.prisma.attendee.findUnique
        .mockResolvedValueOnce(oldBadge as any)
        .mockResolvedValueOnce(blankBadge as any);
      mockCtx.prisma.attendee.update.mockResolvedValue({} as any);
      mockCtx.prisma.checkOut.updateMany.mockResolvedValue({ count: 0 } as any);
      mockCtx.prisma.copy.updateMany.mockResolvedValue({ count: 0 } as any);
      mockCtx.prisma.player.updateMany.mockResolvedValue({ count: 0 } as any);

      await service.badgeReplacement(
        1,
        { fromBadgeNumber: '1', toBadgeNumber: '2' },
        ctx,
      );

      // First update retires the old badge and strips its identity.
      const oldUpdate = mockCtx.prisma.attendee.update.mock.calls[0][0] as any;
      expect(oldUpdate.where.conventionId_badgeNumber.badgeNumber).toBe('1');
      expect(oldUpdate.data).toEqual(
        expect.objectContaining({
          lostBadge: true,
          eligibleForPrizes: false,
          badgeName: 'Real Attendee (Lost Badge)',
          badgeLastName: 'Attendee (Lost Badge)',
          userId: null,
          email: null,
        }),
      );

      // Second update moves the real identity onto the blank badge.
      const newUpdate = mockCtx.prisma.attendee.update.mock.calls[1][0] as any;
      expect(newUpdate.where.conventionId_badgeNumber.badgeNumber).toBe('2');
      expect(newUpdate.data).toEqual(
        expect.objectContaining({
          badgeFirstName: 'Real',
          badgeLastName: 'Attendee',
          legalName: 'Real Attendee',
          badgeName: 'Real Attendee',
          email: 'real@geekway.com',
          user: { connect: { id: 42 } },
          pronouns: { connect: { id: 5 } },
        }),
      );

      // Won copies and game-session players follow the person to the new badge.
      expect(mockCtx.prisma.copy.updateMany).toHaveBeenCalledWith({
        where: { winnerId: oldBadge.id },
        data: { winnerId: blankBadge.id },
      });
      expect(mockCtx.prisma.player.updateMany).toHaveBeenCalledWith({
        where: { attendeeId: oldBadge.id },
        data: { attendeeId: blankBadge.id },
      });
    });

    it('disconnects the user on the new badge when the old badge had no account', async () => {
      runTransaction();
      mockCtx.prisma.attendee.findUnique
        .mockResolvedValueOnce({ ...oldBadge, userId: null } as any)
        .mockResolvedValueOnce(blankBadge as any);
      mockCtx.prisma.attendee.update.mockResolvedValue({} as any);
      mockCtx.prisma.checkOut.updateMany.mockResolvedValue({ count: 0 } as any);
      mockCtx.prisma.copy.updateMany.mockResolvedValue({ count: 0 } as any);
      mockCtx.prisma.player.updateMany.mockResolvedValue({ count: 0 } as any);

      await service.badgeReplacement(
        1,
        { fromBadgeNumber: '1', toBadgeNumber: '2' },
        ctx,
      );

      const newUpdate = mockCtx.prisma.attendee.update.mock.calls[1][0] as any;
      expect(newUpdate.data.user).toEqual({ disconnect: true });
    });

    it('disconnects pronouns on the new badge when the old badge had none', async () => {
      runTransaction();
      mockCtx.prisma.attendee.findUnique
        .mockResolvedValueOnce({ ...oldBadge, pronounsId: null } as any)
        .mockResolvedValueOnce(blankBadge as any);
      mockCtx.prisma.attendee.update.mockResolvedValue({} as any);
      mockCtx.prisma.checkOut.updateMany.mockResolvedValue({ count: 0 } as any);
      mockCtx.prisma.copy.updateMany.mockResolvedValue({ count: 0 } as any);
      mockCtx.prisma.player.updateMany.mockResolvedValue({ count: 0 } as any);

      await service.badgeReplacement(
        1,
        { fromBadgeNumber: '1', toBadgeNumber: '2' },
        ctx,
      );

      // Must not coerce a null pronounsId into connect: { id: 0 }.
      const newUpdate = mockCtx.prisma.attendee.update.mock.calls[1][0] as any;
      expect(newUpdate.data.pronouns).toEqual({ disconnect: true });
    });

    it('accepts a "Blank Vendor" badge as a replacement target', async () => {
      runTransaction();
      mockCtx.prisma.attendee.findUnique
        .mockResolvedValueOnce(oldBadge as any)
        .mockResolvedValueOnce({ id: 2, badgeName: 'Blank Vendor 2' } as any);
      mockCtx.prisma.attendee.update.mockResolvedValue({} as any);
      mockCtx.prisma.checkOut.updateMany.mockResolvedValue({ count: 0 } as any);

      await service.badgeReplacement(
        1,
        { fromBadgeNumber: '1', toBadgeNumber: '2' },
        ctx,
      );

      expect(mockCtx.prisma.attendee.update).toHaveBeenCalledTimes(2);
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

  // Each method wraps a synchronous prisma call in try/catch and rejects on
  // failure. The catch is only reached by a synchronous throw, since the prisma
  // call is returned without being awaited.
  describe('error handling', () => {
    const boom = () => {
      throw new Error('db error');
    };

    it('createAttendee rejects when the create throws', async () => {
      mockCtx.prisma.attendee.create.mockImplementation(boom as any);
      await expect(
        service.createAttendee(
          { convention: { connect: { id: 1 } } } as any,
          ctx,
        ),
      ).rejects.toThrow('db error');
    });

    it('syncAttendee rejects when the upsert throws', async () => {
      mockCtx.prisma.attendee.upsert.mockImplementation(boom as any);
      await expect(
        service.syncAttendee(
          { convention: { connect: { id: 1 } }, tteBadgeNumber: 1 } as any,
          ctx,
        ),
      ).rejects.toThrow('db error');
    });

    it('attendee rejects when the query throws', async () => {
      mockCtx.prisma.attendee.findUnique.mockImplementation(boom as any);
      await expect(service.attendee({ id: 1 }, ctx)).rejects.toThrow(
        'db error',
      );
    });

    it('attendeeWithCheckouts rejects when the query throws', async () => {
      mockCtx.prisma.attendee.findUnique.mockImplementation(boom as any);
      await expect(
        service.attendeeWithCheckouts({ id: 1 }, ctx),
      ).rejects.toThrow('db error');
    });

    it('attendees rejects when the query throws', async () => {
      mockCtx.prisma.attendee.findMany.mockImplementation(boom as any);
      await expect(service.attendees(1, ctx)).rejects.toThrow('db error');
    });

    it('attendeesWithPronounsAndBadgeTypes rejects when the query throws', async () => {
      mockCtx.prisma.attendee.findMany.mockImplementation(boom as any);
      await expect(
        service.attendeesWithPronounsAndBadgeTypes(1, ctx),
      ).rejects.toThrow('db error');
    });

    it('updateAttendee rejects when the update throws', async () => {
      mockCtx.prisma.attendee.update.mockImplementation(boom as any);
      await expect(
        service.updateAttendee({ where: { id: 1 }, data: {} }, ctx),
      ).rejects.toThrow('db error');
    });

    it('badgeTransfer rejects when the update throws', async () => {
      mockCtx.prisma.attendee.update.mockImplementation(boom as any);
      await expect(
        service.badgeTransfer(
          1,
          {
            fromBadgeNumber: '1',
            newBadgeFirstName: 'New',
            newBadgeLastName: 'Owner',
            newBadgePronouns: 'they/them',
          },
          ctx,
        ),
      ).rejects.toThrow('db error');
    });

    it('badgeReplacement rejects when the transaction throws', async () => {
      mockCtx.prisma.$transaction.mockImplementation(boom as any);
      await expect(
        service.badgeReplacement(
          1,
          { fromBadgeNumber: '1', toBadgeNumber: '2' },
          ctx,
        ),
      ).rejects.toThrow('db error');
    });
  });
});
