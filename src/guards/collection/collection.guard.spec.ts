import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { MockContext, createMockContext } from '../../services/prisma/context';
import { CollectionGuard } from './collection.guard';
import { CollectionModule } from '../../modules/collection/collection.module';

describe('CollectionGuard', () => {
  let guard: CollectionGuard;
  let mockCtx: MockContext;

  beforeEach(async () => {
    mockCtx = createMockContext();
    const module: TestingModule = await Test.createTestingModule({
      imports: [CollectionModule],
    }).compile();

    guard = module.get<CollectionGuard>(CollectionGuard);
    guard.ctx = mockCtx;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return false with no col id', async () => {
    const context = createMock<ExecutionContext>({
      getArgByIndex: () => ({}),
    });

    const authed = await guard.canActivate(context);

    expect(authed).toBeFalsy();
  });

  it('should return false with no org id', async () => {
    const context = createMock<ExecutionContext>({
      getArgByIndex: () => ({
        params: { colId: 1 },
      }),
    });

    const authed = await guard.canActivate(context);

    expect(authed).toBeFalsy();
  });

  it('should return false with org id mismatch', async () => {
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

    mockCtx.prisma.collection.findUnique.mockResolvedValue({
      id: 1,
      organizationId: 2,
      name: 'Test Library',
      public: false,
      allowWinning: false,
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
          colId: 1,
        },
      }),
    });

    mockCtx.prisma.collection.findUnique.mockResolvedValue({
      id: 1,
      organizationId: 1,
      name: 'Test Library',
      public: false,
      allowWinning: false,
    });

    const org = {
      id: 1,
      ownerId: 1,
      name: 'Geekway to the Test',
      users: [
        {
          id: 1,
          userId: 1,
          admin: true,
        },
      ],
    };
    mockCtx.prisma.organization.findUnique.mockResolvedValue(org);

    const authed = await guard.canActivate(context);

    expect(authed).toBeTruthy();
  });

  it('should return true with auth on non org owner id', async () => {
    const context = createMock<ExecutionContext>({
      getArgByIndex: () => ({
        user: {
          user: { id: 2, superAdmin: false },
        },
        params: {
          id: 1,
          colId: 1,
        },
      }),
    });

    mockCtx.prisma.collection.findUnique.mockResolvedValue({
      id: 1,
      organizationId: 1,
      name: 'Test Library',
      public: false,
      allowWinning: false,
    });

    const org = {
      id: 1,
      ownerId: 1,
      name: 'Geekway to the Test',
      users: [
        {
          id: 1,
          userId: 2,
          admin: true,
        },
      ],
    };
    mockCtx.prisma.organization.findUnique.mockResolvedValue(org);

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
          orgId: 1,
        },
      }),
    });

    mockCtx.prisma.collection.findUnique.mockResolvedValue({
      id: 1,
      organizationId: 1,
      name: 'Test Library',
      public: false,
      allowWinning: false,
    });

    const org = {
      id: 1,
      ownerId: 1,
      name: 'Geekway to the Test',
      users: [
        {
          id: 1,
          userId: 2,
          admin: true,
        },
      ],
    };
    mockCtx.prisma.organization.findUnique.mockResolvedValue(org);

    const authed = await guard.canActivate(context);

    expect(authed).toBeFalsy();
  });

  it('should return true with org user auth', async () => {
    const context = createMock<ExecutionContext>({
      getArgByIndex: () => ({
        user: {
          user: { id: 2, superAdmin: false },
        },
        params: {
          id: 1,
          orgId: 1,
          colId: 1,
        },
      }),
    });

    mockCtx.prisma.collection.findUnique.mockResolvedValue({
      id: 1,
      organizationId: 1,
      name: 'Test Library',
      public: false,
      allowWinning: false,
    });

    const org = {
      id: 1,
      ownerId: 1,
      name: 'Geekway to the Test',
      users: [
        {
          id: 1,
          userId: 2,
          admin: true,
        },
      ],
    };
    mockCtx.prisma.organization.findUnique.mockResolvedValue(org);

    const authed = await guard.canActivate(context);

    expect(authed).toBeTruthy();
  });

  it('should return false after everything else', async () => {
    const context = createMock<ExecutionContext>({
      getArgByIndex: () => ({
        user: {
          user: { id: 2, superAdmin: false },
        },
        params: {
          id: 1,
          orgId: 1,
          colId: 1,
        },
      }),
    });

    mockCtx.prisma.collection.findUnique.mockResolvedValue({
      id: 1,
      organizationId: 1,
      name: 'Test Library',
      public: false,
      allowWinning: false,
    });

    const org = {
      id: 1,
      ownerId: 1,
      name: 'Geekway to the Test',
      users: [
        {
          id: 3,
          admin: true,
        },
      ],
    };
    mockCtx.prisma.organization.findUnique.mockResolvedValue(org);

    const authed = await guard.canActivate(context);

    expect(authed).toBeFalsy();
  });
});
