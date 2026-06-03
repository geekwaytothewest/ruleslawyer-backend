import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { MockContext, createMockContext } from '../../services/prisma/context';
import { AttendeeGuard } from './attendee.guard';
import { AttendeeModule } from '../../modules/attendee/attendee.module';

describe('AttendeeGuard', () => {
  let guard: AttendeeGuard;
  let mockCtx: MockContext;

  // Builds the request the guard reads off of getArgByIndex(0).
  const contextFor = (user: any, id: any = 1) =>
    createMock<ExecutionContext>({
      getArgByIndex: () => ({ user: { user }, params: { id } }),
    });

  beforeEach(async () => {
    mockCtx = createMockContext();
    const module: TestingModule = await Test.createTestingModule({
      imports: [AttendeeModule],
    }).compile();

    guard = module.get<AttendeeGuard>(AttendeeGuard);
    guard.ctx = mockCtx;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('returns false when the attendee does not exist', async () => {
    mockCtx.prisma.attendee.findUnique.mockResolvedValue(null);

    const authed = await guard.canActivate(
      contextFor({ id: 1, superAdmin: false }),
    );

    expect(authed).toBe(false);
  });

  it('returns true for a super admin', async () => {
    mockCtx.prisma.attendee.findUnique.mockResolvedValue({
      id: 1,
      conventionId: 10,
      userId: 99,
    } as any);

    const authed = await guard.canActivate(
      contextFor({ id: 1, superAdmin: true }),
    );

    expect(authed).toBe(true);
  });

  it('returns true when the user owns the attendee record', async () => {
    mockCtx.prisma.attendee.findUnique.mockResolvedValue({
      id: 1,
      conventionId: 10,
      userId: 7,
    } as any);

    const authed = await guard.canActivate(
      contextFor({ id: 7, superAdmin: false }),
    );

    expect(authed).toBe(true);
  });

  it('returns true when the user is a geek guide or admin on the convention', async () => {
    mockCtx.prisma.attendee.findUnique.mockResolvedValue({
      id: 1,
      conventionId: 10,
      userId: 99,
    } as any);
    mockCtx.prisma.convention.findUnique.mockResolvedValue({
      id: 10,
      organizationId: 20,
      users: [{ userId: 7, admin: false, geekGuide: true }],
    } as any);

    const authed = await guard.canActivate(
      contextFor({ id: 7, superAdmin: false }),
    );

    expect(authed).toBe(true);
  });

  it('returns true when the user owns the organization', async () => {
    mockCtx.prisma.attendee.findUnique.mockResolvedValue({
      id: 1,
      conventionId: 10,
      userId: 99,
    } as any);
    mockCtx.prisma.convention.findUnique.mockResolvedValue({
      id: 10,
      organizationId: 20,
      users: [],
    } as any);
    mockCtx.prisma.organization.findUnique.mockResolvedValue({
      id: 20,
      ownerId: 7,
      users: [],
    } as any);

    const authed = await guard.canActivate(
      contextFor({ id: 7, superAdmin: false }),
    );

    expect(authed).toBe(true);
  });

  it('returns true when the user is an admin or geek guide on the organization', async () => {
    mockCtx.prisma.attendee.findUnique.mockResolvedValue({
      id: 1,
      conventionId: 10,
      userId: 99,
    } as any);
    mockCtx.prisma.convention.findUnique.mockResolvedValue({
      id: 10,
      organizationId: 20,
      users: [],
    } as any);
    mockCtx.prisma.organization.findUnique.mockResolvedValue({
      id: 20,
      ownerId: 99,
      users: [{ userId: 7, admin: true, geekGuide: false }],
    } as any);

    const authed = await guard.canActivate(
      contextFor({ id: 7, superAdmin: false }),
    );

    expect(authed).toBe(true);
  });

  it('returns false when the user has no relationship to the attendee', async () => {
    mockCtx.prisma.attendee.findUnique.mockResolvedValue({
      id: 1,
      conventionId: 10,
      userId: 99,
    } as any);
    mockCtx.prisma.convention.findUnique.mockResolvedValue({
      id: 10,
      organizationId: 20,
      users: [{ userId: 8, admin: true, geekGuide: true }],
    } as any);
    mockCtx.prisma.organization.findUnique.mockResolvedValue({
      id: 20,
      ownerId: 99,
      users: [{ userId: 8, admin: true, geekGuide: true }],
    } as any);

    const authed = await guard.canActivate(
      contextFor({ id: 7, superAdmin: false }),
    );

    expect(authed).toBe(false);
  });
});
