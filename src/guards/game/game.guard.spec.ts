import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { MockContext, createMockContext } from '../../services/prisma/context';
import { GameGuard } from './game.guard';
import { GameModule } from '../../modules/game/game.module';

const game = {
  id: 1,
  name: 'Test Game',
  organizationId: 1,
  bggId: null,
  copies: [],
} as any;

const org = {
  id: 1,
  ownerId: 1,
  name: 'Geekway to the Test',
  enableBggSupport: false,
  users: [
    {
      id: 1,
      userId: 2,
      admin: true,
    },
  ],
};

describe('GameGuard', () => {
  let guard: GameGuard;
  let mockCtx: MockContext;

  beforeEach(async () => {
    mockCtx = createMockContext();
    const module: TestingModule = await Test.createTestingModule({
      imports: [GameModule],
    }).compile();

    guard = module.get<GameGuard>(GameGuard);
    guard.ctx = mockCtx;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return false if no user', async () => {
      const context = createMock<ExecutionContext>({
        getArgByIndex: () => ({
          params: { id: 1 },
        }),
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

    it('should return false if game not found', async () => {
      const context = createMock<ExecutionContext>({
        getArgByIndex: () => ({
          user: { user: { id: 1, superAdmin: false } },
          params: { id: 1 },
        }),
      });

      mockCtx.prisma.game.findUnique.mockResolvedValue(null);

      expect(await guard.canActivate(context)).toBeFalsy();
    });

    it('should fall back to params.gameId when id is missing', async () => {
      const context = createMock<ExecutionContext>({
        getArgByIndex: () => ({
          user: { user: { id: 1, superAdmin: false } },
          params: { gameId: 1 },
        }),
      });

      mockCtx.prisma.game.findUnique.mockResolvedValue(game);
      mockCtx.prisma.organization.findUnique.mockResolvedValue(org);

      expect(await guard.canActivate(context)).toBeTruthy();
    });

    it('should return true if user is the org owner', async () => {
      const context = createMock<ExecutionContext>({
        getArgByIndex: () => ({
          user: { user: { id: 1, superAdmin: false } },
          params: { id: 1 },
        }),
      });

      mockCtx.prisma.game.findUnique.mockResolvedValue(game);
      mockCtx.prisma.organization.findUnique.mockResolvedValue(org);

      expect(await guard.canActivate(context)).toBeTruthy();
    });

    it('should return true if user is an org admin', async () => {
      const context = createMock<ExecutionContext>({
        getArgByIndex: () => ({
          user: { user: { id: 2, superAdmin: false } },
          params: { id: 1 },
        }),
      });

      mockCtx.prisma.game.findUnique.mockResolvedValue(game);
      mockCtx.prisma.organization.findUnique.mockResolvedValue(org);

      expect(await guard.canActivate(context)).toBeTruthy();
    });

    it('should return false if user has no matching org permission', async () => {
      const context = createMock<ExecutionContext>({
        getArgByIndex: () => ({
          user: { user: { id: 3, superAdmin: false } },
          params: { id: 1 },
        }),
      });

      mockCtx.prisma.game.findUnique.mockResolvedValue(game);
      mockCtx.prisma.organization.findUnique.mockResolvedValue(org);

      expect(await guard.canActivate(context)).toBeFalsy();
    });

    // The game id resolves from params.id, falling back to params.gameId.
    // Supply both with conflicting values and assert the lookup used the
    // higher-priority source, so a reordered fallback would fail.
    it('prefers params.id over params.gameId', async () => {
      const context = createMock<ExecutionContext>({
        getArgByIndex: () => ({
          user: { user: { id: 1, superAdmin: false } },
          params: { id: 1, gameId: 2 },
        }),
      });

      mockCtx.prisma.game.findUnique.mockResolvedValue(game);
      mockCtx.prisma.organization.findUnique.mockResolvedValue(org);

      expect(await guard.canActivate(context)).toBeTruthy();
      expect(mockCtx.prisma.game.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 } }),
      );
    });
  });
});
