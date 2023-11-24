import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { MockContext, createMockContext } from '../../services/prisma/context';
import { ConventionGuard } from './convention.guard';
import { ConventionModule } from '../../modules/convention/convention.module';

describe('ConventionGuard', () => {
  let guard: ConventionGuard;
  let mockCtx: MockContext;

  beforeEach(async () => {
    mockCtx = createMockContext();
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConventionModule],
    }).compile();

    guard = module.get<ConventionGuard>(ConventionGuard);
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
