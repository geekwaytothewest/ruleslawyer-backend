import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { PrizeEntryGuard } from './prize-entry.guard';
import { ConventionModule } from '../../modules/convention/convention.module';
import { OrganizationModule } from '../../modules/organization/organization.module';
import { PrismaService } from '../../services/prisma/prisma.service';
import { MockContext, createMockContext } from '../../services/prisma/context';

const convention = {
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
  playAndWinCollectionId: null,
  playAndWinWinnersAnnounced: false,
  playAndWinWinnersSelected: false,
  tteConventionId: 'not real',
  users: [],
} as any;

describe('PrizeEntryGuard', () => {
  let guard: PrizeEntryGuard;
  let mockCtx: MockContext;

  beforeEach(async () => {
    mockCtx = createMockContext();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [],
      providers: [PrizeEntryGuard, PrismaService],
      imports: [ConventionModule, OrganizationModule],
    }).compile();

    guard = module.get<PrizeEntryGuard>(PrizeEntryGuard);
    guard.ctx = mockCtx;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return false if no user', async () => {
      const context = createMock<ExecutionContext>({
        getArgByIndex: () => ({
          params: { id: 1, conId: 1 },
        }),
      });

      expect(await guard.canActivate(context)).toBeFalsy();
    });

    it('should return true for a superAdmin', async () => {
      const context = createMock<ExecutionContext>({
        getArgByIndex: () => ({
          user: { user: { id: 1, superAdmin: true } },
          params: { id: 1, conId: 1 },
        }),
      });

      expect(await guard.canActivate(context)).toBeTruthy();
    });

    it('should return false if no organizationId', async () => {
      const context = createMock<ExecutionContext>({
        getArgByIndex: () => ({
          user: { user: { id: 1, superAdmin: false } },
          params: { conId: 1 },
        }),
      });

      expect(await guard.canActivate(context)).toBeFalsy();
    });

    it('should return false if no conventionId', async () => {
      const context = createMock<ExecutionContext>({
        getArgByIndex: () => ({
          user: { user: { id: 1, superAdmin: false } },
          params: { id: 1 },
        }),
      });

      expect(await guard.canActivate(context)).toBeFalsy();
    });

    it('should return false if convention org does not match', async () => {
      const context = createMock<ExecutionContext>({
        getArgByIndex: () => ({
          user: { user: { id: 1, superAdmin: false } },
          params: { id: 2, conId: 1 },
        }),
      });

      mockCtx.prisma.convention.findUnique.mockResolvedValue(convention);

      expect(await guard.canActivate(context)).toBeFalsy();
    });

    it('should return true for a convention attendee', async () => {
      const context = createMock<ExecutionContext>({
        getArgByIndex: () => ({
          user: { user: { id: 5, superAdmin: false } },
          params: { id: 1, conId: 1 },
        }),
      });

      mockCtx.prisma.convention.findUnique.mockResolvedValue({
        ...convention,
        users: [{ id: 1, userId: 5, attendee: true }],
      });

      expect(await guard.canActivate(context)).toBeTruthy();
    });

    it('should return true if user is the org owner', async () => {
      const context = createMock<ExecutionContext>({
        getArgByIndex: () => ({
          user: { user: { id: 7, superAdmin: false } },
          params: { id: 1, conId: 1 },
        }),
      });

      mockCtx.prisma.convention.findUnique.mockResolvedValue(convention);
      mockCtx.prisma.organization.findUnique.mockResolvedValue({
        id: 1,
        ownerId: 7,
        name: 'Geekway to the Test',
        users: [],
      } as any);

      expect(await guard.canActivate(context)).toBeTruthy();
    });

    it('should return true if user is an org geekGuide', async () => {
      const context = createMock<ExecutionContext>({
        getArgByIndex: () => ({
          user: { user: { id: 8, superAdmin: false } },
          params: { orgId: 1, conId: 1 },
        }),
      });

      mockCtx.prisma.convention.findUnique.mockResolvedValue(convention);
      mockCtx.prisma.organization.findUnique.mockResolvedValue({
        id: 1,
        ownerId: 1,
        name: 'Geekway to the Test',
        users: [{ id: 1, userId: 8, geekGuide: true }],
      } as any);

      expect(await guard.canActivate(context)).toBeTruthy();
    });

    it('should return false if user has no permissions anywhere', async () => {
      const context = createMock<ExecutionContext>({
        getArgByIndex: () => ({
          user: { user: { id: 9, superAdmin: false } },
          params: { id: 1, conId: 1 },
        }),
      });

      mockCtx.prisma.convention.findUnique.mockResolvedValue(convention);
      mockCtx.prisma.organization.findUnique.mockResolvedValue({
        id: 1,
        ownerId: 1,
        name: 'Geekway to the Test',
        users: [],
      } as any);

      expect(await guard.canActivate(context)).toBeFalsy();
    });

    // organizationId resolves from params.id, falling back to params.orgId.
    // The convention belongs to org 1, so if the fallback wrongly preferred
    // params.orgId (2) the org-match check would fail; asserting the org
    // lookup id pins down which source won.
    it('prefers params.id over params.orgId for the organization id', async () => {
      const context = createMock<ExecutionContext>({
        getArgByIndex: () => ({
          user: { user: { id: 7, superAdmin: false } },
          params: { id: 1, orgId: 2, conId: 1 },
        }),
      });

      mockCtx.prisma.convention.findUnique.mockResolvedValue(convention);
      mockCtx.prisma.organization.findUnique.mockResolvedValue({
        id: 1,
        ownerId: 7,
        name: 'Geekway to the Test',
        users: [],
      } as any);

      expect(await guard.canActivate(context)).toBeTruthy();
      expect(mockCtx.prisma.organization.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 } }),
      );
    });
  });
});
