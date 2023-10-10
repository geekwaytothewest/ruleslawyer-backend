import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { MockContext, createMockContext } from '../../services/prisma/context';
import { PrismaService } from '../../services/prisma/prisma.service';
import { ConventionGuard } from './convention.guard';
import { ConventionService } from '../../services/convention/convention.service';
import { AttendeeService } from '../../services/attendee/attendee.service';
import { TabletopeventsService } from '../../services/tabletopevents/tabletopevents.service';
import { OrganizationService } from '../../services/organization/organization.service';
import { HttpModule } from '@nestjs/axios';

describe('ConventionGuard', () => {
  let guard: ConventionGuard;
  let mockCtx: MockContext;

  beforeEach(async () => {
    mockCtx = createMockContext();
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      controllers: [],
      providers: [
        ConventionGuard,
        ConventionService,
        PrismaService,
        AttendeeService,
        TabletopeventsService,
        OrganizationService,
      ],
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
      endDate: null,
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
      endDate: null,
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
          admin: true,
        },
      ],
    };
    mockCtx.prisma.convention.findUnique.mockResolvedValue(con);

    const authed = await guard.canActivate(context);

    expect(authed).toBeFalsy();
  });
});
