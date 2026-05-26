import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { MockContext, createMockContext } from '../../services/prisma/context';
import { ConventionReadGuard } from './convention-read.guard';
import { ConventionWriteGuard } from './convention-write.guard';
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

describe('ConventionGuard', () => {
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

  it('should return false with no con id', async () => {
    const context = createMock<ExecutionContext>({
      getArgByIndex: () => ({}),
    });

    const authed = await guard.canActivate(context);

    expect(authed).toBeFalsy();
  });

  it('should return true with auth', async () => {
    const context = createMock<ExecutionContext>({
      getArgByIndex: () => ({
        user: {
          user: { id: 1, superAdmin: true },
        },
        params: {
          id: 1,
        },
      }),
    });

    const con = {
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
      users: [
        {
          id: 1,
          userId: 1,
          admin: true,
        },
      ],
    };
    mockCtx.prisma.convention.findUnique.mockResolvedValue(con);

    const authed = await guard.canActivate(context);

    expect(authed).toBeTruthy();
  });

  it('should return false with bad auth', async () => {
    const context = createMock<ExecutionContext>({
      getArgByIndex: () => ({
        user: {
          user: { id: 2, superAdmin: false },
        },
        params: {
          id: 1,
        },
      }),
    });

    const con = {
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
      users: [
        {
          id: 1,
          userId: 1,
          admin: true,
        },
      ],
    };
    mockCtx.prisma.convention.findUnique.mockResolvedValue(con);

    const authed = await guard.canActivate(context);

    expect(authed).toBeFalsy();
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
    const context = createMock<ExecutionContext>({
      getArgByIndex: () => ({ params: { id: 1 } }),
    });

    expect(await guard.canActivate(context)).toBeFalsy();
  });

  it('should return true for a superAdmin', async () => {
    const context = createMock<ExecutionContext>({
      getArgByIndex: () => ({
        user: { user: { id: 1, superAdmin: true } },
        params: { id: 1 },
      }),
    });

    expect(await guard.canActivate(context)).toBeTruthy();
  });

  it('should return false with no convention id', async () => {
    const context = createMock<ExecutionContext>({
      getArgByIndex: () => ({
        user: { user: { id: 1, superAdmin: false } },
        params: {},
      }),
    });

    expect(await guard.canActivate(context)).toBeFalsy();
  });

  it('should fall back to params.conId', async () => {
    const context = createMock<ExecutionContext>({
      getArgByIndex: () => ({
        user: { user: { id: 2, superAdmin: false } },
        params: { conId: 1 },
      }),
    });

    mockCtx.prisma.convention.findUnique.mockResolvedValue({
      ...baseCon,
      users: [{ id: 1, userId: 2, admin: true }],
    });

    expect(await guard.canActivate(context)).toBeTruthy();
  });

  it('should return true for a convention admin', async () => {
    const context = createMock<ExecutionContext>({
      getArgByIndex: () => ({
        user: { user: { id: 2, superAdmin: false } },
        params: { id: 1 },
      }),
    });

    mockCtx.prisma.convention.findUnique.mockResolvedValue({
      ...baseCon,
      users: [{ id: 1, userId: 2, admin: true }],
    });

    expect(await guard.canActivate(context)).toBeTruthy();
  });

  it('should return false for a non-admin convention user', async () => {
    const context = createMock<ExecutionContext>({
      getArgByIndex: () => ({
        user: { user: { id: 2, superAdmin: false } },
        params: { id: 1 },
      }),
    });

    mockCtx.prisma.convention.findUnique.mockResolvedValue({
      ...baseCon,
      users: [{ id: 1, userId: 2, admin: false }],
    });

    expect(await guard.canActivate(context)).toBeFalsy();
  });
});
