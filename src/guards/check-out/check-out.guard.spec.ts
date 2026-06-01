import { Test, TestingModule } from '@nestjs/testing';
import { MockContext, createMockContext } from '../../services/prisma/context';
import { CheckOutGuard } from './check-out.guard';
import { CheckOutModule } from '../../modules/check-out/check-out.module';
import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext } from '@nestjs/common';

const buildConvention = (overrides: any = {}): any => ({
  id: 1,
  organizationId: 1,
  name: 'Geekway to the Test',
  theme: 'Jest....er. Get it?',
  logo: Buffer.from(''),
  logoSquare: Buffer.from(''),
  icon: '',
  startDate: new Date(),
  endDate: new Date(),
  registrationUrl: null,
  typeId: 1,
  annual: '1st Annual',
  size: 1,
  cancelled: false,
  playAndWinAnnounced: false,
  doorPrizesAnnounced: false,
  doorPrizeCollectionId: null,
  playAndWinCollectionId: 1,
  playAndWinWinnersAnnounced: false,
  playAndWinWinnersSelected: false,
  tteConventionId: 'not real',
  users: [],
  ...overrides,
});

const buildOrganization = (overrides: any = {}): any => ({
  id: 1,
  ownerId: 1,
  name: 'Geekway to the Test',
  users: [],
  ...overrides,
});

describe('CheckOutGuard', () => {
  let guard: CheckOutGuard;
  let mockCtx: MockContext;

  beforeEach(async () => {
    mockCtx = createMockContext();
    const module: TestingModule = await Test.createTestingModule({
      imports: [CheckOutModule],
    }).compile();

    guard = module.get<CheckOutGuard>(CheckOutGuard);
    guard.ctx = mockCtx;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return false if no user', async () => {
      const context = createMock<ExecutionContext>({
        getArgByIndex: () => ({
          params: {
            id: 1,
            colId: 1,
            conId: 1,
          },
        }),
      });

      await expect(guard.canActivate(context)).resolves.toBeFalsy();
    });

    it('should return true if superAdmin', async () => {
      const context = createMock<ExecutionContext>({
        getArgByIndex: () => ({
          user: {
            user: { id: 1, superAdmin: true },
          },
          params: {
            id: 1,
            colId: 1,
            conId: 1,
          },
        }),
      });

      await expect(guard.canActivate(context)).resolves.toBeTruthy();
    });

    it('should return false if no organizationId', async () => {
      const context = createMock<ExecutionContext>({
        getArgByIndex: () => ({
          user: {
            user: { id: 1 },
          },
          params: {
            colId: 1,
            conId: 1,
          },
        }),
      });

      await expect(guard.canActivate(context)).resolves.toBeFalsy();
    });

    it('should return false if no conventionId', async () => {
      const context = createMock<ExecutionContext>({
        getArgByIndex: () => ({
          user: {
            user: { id: 1 },
          },
          params: {
            id: 1,
            colId: 1,
          },
        }),
      });

      await expect(guard.canActivate(context)).resolves.toBeFalsy();
    });

    it('should return false if convention not found', async () => {
      const context = createMock<ExecutionContext>({
        getArgByIndex: () => ({
          user: {
            user: { id: 1 },
          },
          params: {
            id: 1,
            conId: 1,
            colId: 1,
          },
        }),
      });

      mockCtx.prisma.convention.findUnique.mockResolvedValue(null);

      await expect(guard.canActivate(context)).resolves.toBeFalsy();
    });

    it('should return false if convention org id mismatch', async () => {
      const context = createMock<ExecutionContext>({
        getArgByIndex: () => ({
          user: {
            user: { id: 1, superAdmin: false },
          },
          params: {
            id: 2,
            conId: 1,
            colId: 1,
          },
        }),
      });

      const con = buildConvention({
        organizationId: 1,
        users: [{ id: 1, userId: 1, admin: true }],
      });

      mockCtx.prisma.convention.findUnique.mockResolvedValue(con);

      await expect(guard.canActivate(context)).resolves.toBeFalsy();
    });

    it('should return true if convention admin', async () => {
      const context = createMock<ExecutionContext>({
        getArgByIndex: () => ({
          user: {
            user: { id: 1, superAdmin: false },
          },
          params: {
            id: 1,
            conId: 1,
            colId: 1,
          },
        }),
      });

      const con = buildConvention({
        users: [{ id: 99, userId: 1, admin: true, geekGuide: false }],
      });

      mockCtx.prisma.convention.findUnique.mockResolvedValue(con);

      await expect(guard.canActivate(context)).resolves.toBeTruthy();
    });

    it('should return true if convention geek guide', async () => {
      const context = createMock<ExecutionContext>({
        getArgByIndex: () => ({
          user: {
            user: { id: 1, superAdmin: false },
          },
          params: {
            id: 1,
            conId: 1,
            colId: 1,
          },
        }),
      });

      const con = buildConvention({
        users: [{ id: 99, userId: 1, admin: false, geekGuide: true }],
      });

      mockCtx.prisma.convention.findUnique.mockResolvedValue(con);

      await expect(guard.canActivate(context)).resolves.toBeTruthy();
    });

    it('should return false if convention permission lacks admin/geekGuide', async () => {
      const context = createMock<ExecutionContext>({
        getArgByIndex: () => ({
          user: {
            user: { id: 1, superAdmin: false },
          },
          params: {
            id: 1,
            conId: 1,
            colId: 1,
          },
        }),
      });

      const con = buildConvention({
        users: [{ id: 99, userId: 1, admin: false, geekGuide: false }],
      });

      mockCtx.prisma.convention.findUnique.mockResolvedValue(con);

      await expect(guard.canActivate(context)).resolves.toBeFalsy();
    });

    it('should return false if convention user id does not match', async () => {
      const context = createMock<ExecutionContext>({
        getArgByIndex: () => ({
          user: {
            user: { id: 1, superAdmin: false },
          },
          params: {
            id: 1,
            conId: 1,
            colId: 1,
          },
        }),
      });

      // Permission row id collides with user id, but userId belongs to a
      // different user — this must NOT grant access.
      const con = buildConvention({
        users: [{ id: 1, userId: 2, admin: true, geekGuide: true }],
      });

      mockCtx.prisma.convention.findUnique.mockResolvedValue(con);

      await expect(guard.canActivate(context)).resolves.toBeFalsy();
    });

    it('should return true if user is org owner', async () => {
      const context = createMock<ExecutionContext>({
        getArgByIndex: () => ({
          user: {
            user: { id: 1, superAdmin: false },
          },
          params: {
            id: 1,
            conId: 1,
            colId: 1,
          },
        }),
      });

      const con = buildConvention({
        users: [{ id: 99, userId: 2, geekGuide: true }],
      });

      mockCtx.prisma.convention.findUnique.mockResolvedValue(con);

      const org = buildOrganization({
        ownerId: 1,
        users: [{ id: 1, userId: 2, admin: true }],
      });

      mockCtx.prisma.organization.findUnique.mockResolvedValue(org);

      await expect(guard.canActivate(context)).resolves.toBeTruthy();
    });

    it('should return true if user is org geek guide', async () => {
      const context = createMock<ExecutionContext>({
        getArgByIndex: () => ({
          user: {
            user: { id: 2, superAdmin: false },
          },
          params: {
            id: 1,
            conId: 1,
            colId: 1,
          },
        }),
      });

      const con = buildConvention({
        users: [{ id: 99, userId: 99 }],
      });

      mockCtx.prisma.convention.findUnique.mockResolvedValue(con);

      const org = buildOrganization({
        ownerId: 1,
        users: [{ id: 1, userId: 2, geekGuide: true }],
      });

      mockCtx.prisma.organization.findUnique.mockResolvedValue(org);

      await expect(guard.canActivate(context)).resolves.toBeTruthy();
    });

    it('should return true if user is org admin', async () => {
      const context = createMock<ExecutionContext>({
        getArgByIndex: () => ({
          user: {
            user: { id: 2, superAdmin: false },
          },
          params: {
            id: 1,
            conId: 1,
            colId: 1,
          },
        }),
      });

      const con = buildConvention({
        users: [{ id: 99, userId: 99 }],
      });

      mockCtx.prisma.convention.findUnique.mockResolvedValue(con);

      const org = buildOrganization({
        ownerId: 1,
        users: [{ id: 1, userId: 2, admin: true }],
      });

      mockCtx.prisma.organization.findUnique.mockResolvedValue(org);

      await expect(guard.canActivate(context)).resolves.toBeTruthy();
    });

    it('should return false for user with no matching permission', async () => {
      const context = createMock<ExecutionContext>({
        getArgByIndex: () => ({
          user: {
            user: { id: 1, superAdmin: false },
          },
          params: {
            id: 1,
            conId: 1,
            colId: 1,
          },
        }),
      });

      const con = buildConvention({
        users: [{ id: 99, userId: 2, geekGuide: true }],
      });

      mockCtx.prisma.convention.findUnique.mockResolvedValue(con);

      const org = buildOrganization({
        ownerId: 9,
        users: [{ id: 1, userId: 2, admin: true }],
      });

      mockCtx.prisma.organization.findUnique.mockResolvedValue(org);

      await expect(guard.canActivate(context)).resolves.toBeFalsy();
    });

    it('should return false if no users', async () => {
      const context = createMock<ExecutionContext>({
        getArgByIndex: () => ({
          user: {
            user: { id: 1, superAdmin: false },
          },
          params: {
            id: 1,
            conId: 1,
            colId: 1,
          },
        }),
      });

      const con = buildConvention({ users: [] });

      mockCtx.prisma.convention.findUnique.mockResolvedValue(con);

      const org = buildOrganization({ ownerId: 9, users: [] });

      mockCtx.prisma.organization.findUnique.mockResolvedValue(org);

      await expect(guard.canActivate(context)).resolves.toBeFalsy();
    });

    // organizationId resolves from params.id, falling back to params.orgId.
    // The convention belongs to org 1, so if the fallback wrongly preferred
    // params.orgId (2) the org-match check would fail; asserting the org
    // lookup id pins down which source won.
    it('prefers params.id over params.orgId for the organization id', async () => {
      const context = createMock<ExecutionContext>({
        getArgByIndex: () => ({
          user: {
            user: { id: 1, superAdmin: false },
          },
          params: {
            id: 1,
            orgId: 2,
            conId: 1,
            colId: 1,
          },
        }),
      });

      const con = buildConvention({ organizationId: 1, users: [] });

      mockCtx.prisma.convention.findUnique.mockResolvedValue(con);

      const org = buildOrganization({ ownerId: 1, users: [] });

      mockCtx.prisma.organization.findUnique.mockResolvedValue(org);

      await expect(guard.canActivate(context)).resolves.toBeTruthy();
      expect(mockCtx.prisma.organization.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 } }),
      );
    });
  });
});
