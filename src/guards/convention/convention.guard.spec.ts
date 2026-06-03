import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { MockContext, createMockContext } from '../../services/prisma/context';
import { ConventionReadGuard } from './convention-read.guard';
import { ConventionWriteGuard } from './convention-write.guard';
import { ConventionAdminGuard } from './convention-admin.guard';
import { ConventionModule } from '../../modules/convention/convention.module';

const baseCon = {
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
} as any;

const contextFor = (request: any) =>
  createMock<ExecutionContext>({
    getArgByIndex: () => request,
  });

describe('ConventionReadGuard', () => {
  let guard: ConventionReadGuard;
  let mockCtx: MockContext;

  beforeEach(async () => {
    mockCtx = createMockContext();
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConventionModule],
    }).compile();

    guard = module.get<ConventionReadGuard>(ConventionReadGuard);
    guard.ctx = mockCtx;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return false with no user', async () => {
    const context = contextFor({ params: { id: 1 } });

    expect(await guard.canActivate(context)).toBeFalsy();
  });

  it('should return true for a superAdmin', async () => {
    const context = contextFor({
      user: { user: { id: 1, superAdmin: true } },
      params: { id: 1 },
    });

    expect(await guard.canActivate(context)).toBeTruthy();
  });

  it('should return false with no convention id', async () => {
    const context = contextFor({
      user: { user: { id: 1, superAdmin: false } },
      params: {},
    });

    expect(await guard.canActivate(context)).toBeFalsy();
  });

  it('should fall back to params.conId', async () => {
    const context = contextFor({
      user: { user: { id: 2, superAdmin: false } },
      params: { conId: 1 },
    });

    mockCtx.prisma.convention.findUnique.mockResolvedValue({
      ...baseCon,
      users: [{ id: 1, userId: 2, attendee: true }],
    });

    expect(await guard.canActivate(context)).toBeTruthy();
  });

  it('should return true for a convention attendee', async () => {
    const context = contextFor({
      user: { user: { id: 2, superAdmin: false } },
      params: { id: 1 },
    });

    mockCtx.prisma.convention.findUnique.mockResolvedValue({
      ...baseCon,
      users: [{ id: 1, userId: 2, attendee: true }],
    });

    expect(await guard.canActivate(context)).toBeTruthy();
  });

  it('should return true for a convention geekGuide', async () => {
    const context = contextFor({
      user: { user: { id: 2, superAdmin: false } },
      params: { id: 1 },
    });

    mockCtx.prisma.convention.findUnique.mockResolvedValue({
      ...baseCon,
      users: [{ id: 1, userId: 2, geekGuide: true }],
    });

    expect(await guard.canActivate(context)).toBeTruthy();
  });

  it('should return true for a convention admin', async () => {
    const context = contextFor({
      user: { user: { id: 2, superAdmin: false } },
      params: { id: 1 },
    });

    mockCtx.prisma.convention.findUnique.mockResolvedValue({
      ...baseCon,
      users: [{ id: 1, userId: 2, admin: true }],
    });

    expect(await guard.canActivate(context)).toBeTruthy();
  });

  it('should return true for the organization owner', async () => {
    const context = contextFor({
      user: { user: { id: 2, superAdmin: false } },
      params: { id: 1 },
    });

    mockCtx.prisma.convention.findUnique.mockResolvedValue({
      ...baseCon,
      users: [],
    });
    mockCtx.prisma.organization.findUnique.mockResolvedValue({
      id: 1,
      ownerId: 2,
      users: [],
    } as any);

    expect(await guard.canActivate(context)).toBeTruthy();
  });

  it('should return true for an organization admin', async () => {
    const context = contextFor({
      user: { user: { id: 2, superAdmin: false } },
      params: { id: 1 },
    });

    mockCtx.prisma.convention.findUnique.mockResolvedValue({
      ...baseCon,
      users: [],
    });
    mockCtx.prisma.organization.findUnique.mockResolvedValue({
      id: 1,
      ownerId: 99,
      users: [{ id: 1, userId: 2, admin: true }],
    } as any);

    expect(await guard.canActivate(context)).toBeTruthy();
  });

  it('should return true for an organization geekGuide', async () => {
    const context = contextFor({
      user: { user: { id: 2, superAdmin: false } },
      params: { id: 1 },
    });

    mockCtx.prisma.convention.findUnique.mockResolvedValue({
      ...baseCon,
      users: [],
    });
    mockCtx.prisma.organization.findUnique.mockResolvedValue({
      id: 1,
      ownerId: 99,
      users: [{ id: 1, userId: 2, geekGuide: true }],
    } as any);

    expect(await guard.canActivate(context)).toBeTruthy();
  });

  it('should return false for an unrelated user', async () => {
    const context = contextFor({
      user: { user: { id: 2, superAdmin: false } },
      params: { id: 1 },
    });

    mockCtx.prisma.convention.findUnique.mockResolvedValue({
      ...baseCon,
      users: [{ id: 1, userId: 99, admin: true }],
    });
    mockCtx.prisma.organization.findUnique.mockResolvedValue({
      id: 1,
      ownerId: 99,
      users: [{ id: 1, userId: 99, admin: true }],
    } as any);

    expect(await guard.canActivate(context)).toBeFalsy();
  });

  // conId resolves from params.id, falling back to params.conId. Supply both
  // with conflicting values and assert the lookup used the higher-priority one.
  it('prefers params.id over params.conId', async () => {
    const context = contextFor({
      user: { user: { id: 2, superAdmin: false } },
      params: { id: 1, conId: 2 },
    });

    mockCtx.prisma.convention.findUnique.mockResolvedValue({
      ...baseCon,
      users: [{ id: 1, userId: 2, attendee: true }],
    });

    expect(await guard.canActivate(context)).toBeTruthy();
    expect(mockCtx.prisma.convention.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 1 } }),
    );
  });
});

describe('ConventionWriteGuard', () => {
  let guard: ConventionWriteGuard;
  let mockCtx: MockContext;

  beforeEach(async () => {
    mockCtx = createMockContext();
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConventionModule],
    }).compile();

    guard = module.get<ConventionWriteGuard>(ConventionWriteGuard);
    guard.ctx = mockCtx;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return false with no user', async () => {
    const context = contextFor({ params: { id: 1 } });

    expect(await guard.canActivate(context)).toBeFalsy();
  });

  it('should return true for a superAdmin', async () => {
    const context = contextFor({
      user: { user: { id: 1, superAdmin: true } },
      params: { id: 1 },
    });

    expect(await guard.canActivate(context)).toBeTruthy();
  });

  it('should return false with no convention id', async () => {
    const context = contextFor({
      user: { user: { id: 1, superAdmin: false } },
      params: {},
    });

    expect(await guard.canActivate(context)).toBeFalsy();
  });

  it('should fall back to params.conId', async () => {
    const context = contextFor({
      user: { user: { id: 2, superAdmin: false } },
      params: { conId: 1 },
    });

    mockCtx.prisma.convention.findUnique.mockResolvedValue({
      ...baseCon,
      users: [{ id: 1, userId: 2, admin: true }],
    });

    expect(await guard.canActivate(context)).toBeTruthy();
  });

  it('should return true for a convention admin', async () => {
    const context = contextFor({
      user: { user: { id: 2, superAdmin: false } },
      params: { id: 1 },
    });

    mockCtx.prisma.convention.findUnique.mockResolvedValue({
      ...baseCon,
      users: [{ id: 1, userId: 2, admin: true }],
    });

    expect(await guard.canActivate(context)).toBeTruthy();
  });

  it('should return false for a non-admin convention user', async () => {
    const context = contextFor({
      user: { user: { id: 2, superAdmin: false } },
      params: { id: 1 },
    });

    mockCtx.prisma.convention.findUnique.mockResolvedValue({
      ...baseCon,
      users: [{ id: 1, userId: 2, admin: false }],
    });
    mockCtx.prisma.organization.findUnique.mockResolvedValue({
      id: 1,
      ownerId: 99,
      users: [],
    } as any);

    expect(await guard.canActivate(context)).toBeFalsy();
  });

  it('should return false for a convention attendee', async () => {
    const context = contextFor({
      user: { user: { id: 2, superAdmin: false } },
      params: { id: 1 },
    });

    mockCtx.prisma.convention.findUnique.mockResolvedValue({
      ...baseCon,
      users: [{ id: 1, userId: 2, attendee: true }],
    });
    mockCtx.prisma.organization.findUnique.mockResolvedValue({
      id: 1,
      ownerId: 99,
      users: [],
    } as any);

    expect(await guard.canActivate(context)).toBeFalsy();
  });

  it('should return true for the organization owner', async () => {
    const context = contextFor({
      user: { user: { id: 2, superAdmin: false } },
      params: { id: 1 },
    });

    mockCtx.prisma.convention.findUnique.mockResolvedValue({
      ...baseCon,
      users: [],
    });
    mockCtx.prisma.organization.findUnique.mockResolvedValue({
      id: 1,
      ownerId: 2,
      users: [],
    } as any);

    expect(await guard.canActivate(context)).toBeTruthy();
  });

  it('should return true for an organization admin', async () => {
    const context = contextFor({
      user: { user: { id: 2, superAdmin: false } },
      params: { id: 1 },
    });

    mockCtx.prisma.convention.findUnique.mockResolvedValue({
      ...baseCon,
      users: [],
    });
    mockCtx.prisma.organization.findUnique.mockResolvedValue({
      id: 1,
      ownerId: 99,
      users: [{ id: 1, userId: 2, admin: true }],
    } as any);

    expect(await guard.canActivate(context)).toBeTruthy();
  });

  it('should return false for an organization geekGuide', async () => {
    const context = contextFor({
      user: { user: { id: 2, superAdmin: false } },
      params: { id: 1 },
    });

    mockCtx.prisma.convention.findUnique.mockResolvedValue({
      ...baseCon,
      users: [],
    });
    mockCtx.prisma.organization.findUnique.mockResolvedValue({
      id: 1,
      ownerId: 99,
      users: [{ id: 1, userId: 2, geekGuide: true }],
    } as any);

    expect(await guard.canActivate(context)).toBeFalsy();
  });

  it('should return false for an unrelated user', async () => {
    const context = contextFor({
      user: { user: { id: 2, superAdmin: false } },
      params: { id: 1 },
    });

    mockCtx.prisma.convention.findUnique.mockResolvedValue({
      ...baseCon,
      users: [{ id: 1, userId: 99, admin: true }],
    });
    mockCtx.prisma.organization.findUnique.mockResolvedValue({
      id: 1,
      ownerId: 99,
      users: [{ id: 1, userId: 99, admin: true }],
    } as any);

    expect(await guard.canActivate(context)).toBeFalsy();
  });

  // conId resolves from params.id, falling back to params.conId. Supply both
  // with conflicting values and assert the lookup used the higher-priority one.
  it('prefers params.id over params.conId', async () => {
    const context = contextFor({
      user: { user: { id: 2, superAdmin: false } },
      params: { id: 1, conId: 2 },
    });

    mockCtx.prisma.convention.findUnique.mockResolvedValue({
      ...baseCon,
      users: [{ id: 1, userId: 2, admin: true }],
    });

    expect(await guard.canActivate(context)).toBeTruthy();
    expect(mockCtx.prisma.convention.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 1 } }),
    );
  });
});

describe('ConventionAdminGuard', () => {
  let guard: ConventionAdminGuard;
  let mockCtx: MockContext;

  beforeEach(async () => {
    mockCtx = createMockContext();
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConventionModule],
    }).compile();

    guard = module.get<ConventionAdminGuard>(ConventionAdminGuard);
    guard.ctx = mockCtx;
  });

  it('should return false with no user', async () => {
    const context = contextFor({ params: { id: 1 } });
    expect(await guard.canActivate(context)).toBeFalsy();
  });

  it('should return true for a superAdmin', async () => {
    const context = contextFor({
      user: { user: { id: 2, superAdmin: true } },
      params: { id: 1 },
    });
    expect(await guard.canActivate(context)).toBeTruthy();
  });

  it('should return false when no convention id is present', async () => {
    const context = contextFor({ user: { user: { id: 2, superAdmin: false } }, params: {} });
    expect(await guard.canActivate(context)).toBeFalsy();
  });

  it('should fall back to params.conId when params.id is absent', async () => {
    const context = contextFor({
      user: { user: { id: 2, superAdmin: false } },
      params: { conId: 1 },
    });

    mockCtx.prisma.convention.findUnique.mockResolvedValue({
      ...baseCon,
      users: [{ id: 1, userId: 2, admin: true }],
    });

    expect(await guard.canActivate(context)).toBeTruthy();
  });

  it('should return true for a convention admin', async () => {
    const context = contextFor({
      user: { user: { id: 2, superAdmin: false } },
      params: { id: 1 },
    });

    mockCtx.prisma.convention.findUnique.mockResolvedValue({
      ...baseCon,
      users: [{ id: 1, userId: 2, admin: true }],
    });

    expect(await guard.canActivate(context)).toBeTruthy();
  });

  it('should return false for a non-admin convention user', async () => {
    const context = contextFor({
      user: { user: { id: 2, superAdmin: false } },
      params: { id: 1 },
    });

    mockCtx.prisma.convention.findUnique.mockResolvedValue({
      ...baseCon,
      users: [{ id: 1, userId: 2, admin: false, geekGuide: true }],
    });
    mockCtx.prisma.organization.findUnique.mockResolvedValue({
      id: 1,
      ownerId: 99,
      users: [],
    } as any);

    expect(await guard.canActivate(context)).toBeFalsy();
  });

  it('should return true for the organization owner', async () => {
    const context = contextFor({
      user: { user: { id: 2, superAdmin: false } },
      params: { id: 1 },
    });

    mockCtx.prisma.convention.findUnique.mockResolvedValue({
      ...baseCon,
      users: [],
    });
    mockCtx.prisma.organization.findUnique.mockResolvedValue({
      id: 1,
      ownerId: 2,
      users: [],
    } as any);

    expect(await guard.canActivate(context)).toBeTruthy();
  });

  it('should return true for an organization admin', async () => {
    const context = contextFor({
      user: { user: { id: 2, superAdmin: false } },
      params: { id: 1 },
    });

    mockCtx.prisma.convention.findUnique.mockResolvedValue({
      ...baseCon,
      users: [],
    });
    mockCtx.prisma.organization.findUnique.mockResolvedValue({
      id: 1,
      ownerId: 99,
      users: [{ id: 1, userId: 2, admin: true }],
    } as any);

    expect(await guard.canActivate(context)).toBeTruthy();
  });

  it('should return false for an organization geekGuide', async () => {
    const context = contextFor({
      user: { user: { id: 2, superAdmin: false } },
      params: { id: 1 },
    });

    mockCtx.prisma.convention.findUnique.mockResolvedValue({
      ...baseCon,
      users: [],
    });
    mockCtx.prisma.organization.findUnique.mockResolvedValue({
      id: 1,
      ownerId: 99,
      users: [{ id: 1, userId: 2, geekGuide: true }],
    } as any);

    expect(await guard.canActivate(context)).toBeFalsy();
  });

  it('should return false for an unrelated user', async () => {
    const context = contextFor({
      user: { user: { id: 2, superAdmin: false } },
      params: { id: 1 },
    });

    mockCtx.prisma.convention.findUnique.mockResolvedValue({
      ...baseCon,
      users: [{ id: 1, userId: 99, admin: true }],
    });
    mockCtx.prisma.organization.findUnique.mockResolvedValue({
      id: 1,
      ownerId: 99,
      users: [{ id: 1, userId: 99, admin: true }],
    } as any);

    expect(await guard.canActivate(context)).toBeFalsy();
  });

  // conId resolves from params.id, falling back to params.conId. Supply both
  // with conflicting values and assert the lookup used the higher-priority one.
  it('prefers params.id over params.conId', async () => {
    const context = contextFor({
      user: { user: { id: 2, superAdmin: false } },
      params: { id: 1, conId: 2 },
    });

    mockCtx.prisma.convention.findUnique.mockResolvedValue({
      ...baseCon,
      users: [{ id: 1, userId: 2, admin: true }],
    });

    expect(await guard.canActivate(context)).toBeTruthy();
    expect(mockCtx.prisma.convention.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 1 } }),
    );
  });
});
