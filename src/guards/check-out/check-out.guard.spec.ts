import { Test, TestingModule } from '@nestjs/testing';
import { MockContext, createMockContext } from '../../services/prisma/context';
import { CheckOutGuard } from './check-out.guard';
import { CheckOutModule } from '../../modules/check-out/check-out.module';
import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext } from '@nestjs/common';

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
          },
        }),
      });

      expect(guard.canActivate(context)).resolves.toBeFalsy();
    });

    it('should return false if no organizationId', async () => {
      const context = createMock<ExecutionContext>({
        getArgByIndex: () => ({
          user: {
            user: { id: 1, superAdmin: true },
          },
          params: {
            colId: 1,
            conId: 1,
          },
        }),
      });

      expect(guard.canActivate(context)).resolves.toBeFalsy();
    });

    it('should return false if no conventionId', async () => {
      const context = createMock<ExecutionContext>({
        getArgByIndex: () => ({
          user: {
            user: { id: 1, superAdmin: true },
          },
          params: {
            id: 1,
            colId: 1,
          },
        }),
      });

      expect(guard.canActivate(context)).resolves.toBeFalsy();
    });

    it('should return false if no collectionId', async () => {
      const context = createMock<ExecutionContext>({
        getArgByIndex: () => ({
          user: {
            user: { id: 1, superAdmin: true },
          },
          params: {
            id: 1,
            conId: 1,
          },
        }),
      });

      expect(guard.canActivate(context)).resolves.toBeFalsy();
    });

    it('should return false if no convention', async () => {
      const context = createMock<ExecutionContext>({
        getArgByIndex: () => ({
          user: {
            user: { id: 1, superAdmin: true },
          },
          params: {
            id: 1,
            conId: 1,
            colId: 1,
          },
        }),
      });

      mockCtx.prisma.convention.findUnique.mockResolvedValue(null);

      expect(guard.canActivate(context)).resolves.toBeFalsy();
    });

    it('should return false if no play and win id match', async () => {
      const context = createMock<ExecutionContext>({
        getArgByIndex: () => ({
          user: {
            user: { id: 1, superAdmin: true },
          },
          params: {
            id: 1,
            conId: 1,
            colId: 1,
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

      expect(guard.canActivate(context)).resolves.toBeFalsy();
    });

    it('should return true if no users', async () => {
      const context = createMock<ExecutionContext>({
        getArgByIndex: () => ({
          user: {
            user: { id: 1, superAdmin: true },
          },
          params: {
            id: 1,
            conId: 1,
            colId: 1,
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
        playAndWinCollectionId: 1,
        playAndWinWinnersAnnounced: false,
        playAndWinWinnersSelected: false,
        tteConventionId: 'not real',
        users: [],
      };

      mockCtx.prisma.convention.findUnique.mockResolvedValue(con);

      expect(guard.canActivate(context)).resolves.toBeFalsy();
    });

    it('should return true if admin', async () => {
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
        playAndWinCollectionId: 1,
        playAndWinWinnersAnnounced: false,
        playAndWinWinnersSelected: false,
        tteConventionId: 'not real',
        users: [
          {
            id: 1,
            geekGuide: true,
          },
        ],
      };

      mockCtx.prisma.convention.findUnique.mockResolvedValue(con);

      expect(guard.canActivate(context)).resolves.toBeTruthy();
    });

    it('should return false if org id mismatch', async () => {
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
        playAndWinCollectionId: 1,
        playAndWinWinnersAnnounced: false,
        playAndWinWinnersSelected: false,
        tteConventionId: 'not real',
        users: [
          {
            id: 1,
            geekGuide: true,
          },
        ],
      };

      mockCtx.prisma.convention.findUnique.mockResolvedValue(con);

      expect(guard.canActivate(context)).resolves.toBeFalsy();
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
        playAndWinCollectionId: 1,
        playAndWinWinnersAnnounced: false,
        playAndWinWinnersSelected: false,
        tteConventionId: 'not real',
        users: [
          {
            id: 2,
            geekGuide: true,
          },
        ],
      };

      mockCtx.prisma.convention.findUnique.mockResolvedValue(con);

      const org = {
        id: 1,
        ownerId: 1,
        name: 'Geekway to the Test',
        users: [
          {
            id: 1,
            admin: true,
          },
        ],
      };

      mockCtx.prisma.organization.findUnique.mockResolvedValue(org);

      expect(guard.canActivate(context)).resolves.toBeTruthy();
    });

    it('should return true if user is org geekguide user', async () => {
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
        playAndWinCollectionId: 1,
        playAndWinWinnersAnnounced: false,
        playAndWinWinnersSelected: false,
        tteConventionId: 'not real',
        users: [
          {
            id: 2,
          },
        ],
      };

      mockCtx.prisma.convention.findUnique.mockResolvedValue(con);

      const org = {
        id: 1,
        ownerId: 1,
        name: 'Geekway to the Test',
        users: [
          {
            id: 2,
            geekGuide: true,
          },
        ],
      };

      mockCtx.prisma.organization.findUnique.mockResolvedValue(org);

      expect(guard.canActivate(context)).resolves.toBeTruthy();
    });

    it('should return true if user is org user', async () => {
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
        playAndWinCollectionId: 1,
        playAndWinWinnersAnnounced: false,
        playAndWinWinnersSelected: false,
        tteConventionId: 'not real',
        users: [
          {
            id: 2,
          },
        ],
      };

      mockCtx.prisma.convention.findUnique.mockResolvedValue(con);

      const org = {
        id: 1,
        ownerId: 1,
        name: 'Geekway to the Test',
        users: [
          {
            id: 2,
            admin: true,
          },
        ],
      };

      mockCtx.prisma.organization.findUnique.mockResolvedValue(org);

      expect(guard.canActivate(context)).resolves.toBeTruthy();
    });

    it('should return false for bad user', async () => {
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
        playAndWinCollectionId: 1,
        playAndWinWinnersAnnounced: false,
        playAndWinWinnersSelected: false,
        tteConventionId: 'not real',
        users: [
          {
            id: 2,
            geekGuide: true,
          },
        ],
      };

      mockCtx.prisma.convention.findUnique.mockResolvedValue(con);

      expect(guard.canActivate(context)).resolves.toBeFalsy();
    });

    it('should return false for no users', async () => {
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
        playAndWinCollectionId: 1,
        playAndWinWinnersAnnounced: false,
        playAndWinWinnersSelected: false,
        tteConventionId: 'not real',
        users: [],
      };

      mockCtx.prisma.convention.findUnique.mockResolvedValue(con);

      expect(guard.canActivate(context)).resolves.toBeFalsy();
    });
  });
});
