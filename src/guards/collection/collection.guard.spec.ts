import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { OrganizationService } from '../../services/organization/organization.service';
import { MockContext, createMockContext } from '../../services/prisma/context';
import { PrismaService } from '../../services/prisma/prisma.service';
import { CollectionGuard } from './collection.guard';
import { CollectionService } from '../../services/collection/collection.service';

describe('CollectionGuard', () => {
  let guard: CollectionGuard;
  let mockCtx: MockContext;

  beforeEach(async () => {
    mockCtx = createMockContext();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [],
      providers: [
        CollectionGuard,
        CollectionService,
        OrganizationService,
        PrismaService,
      ],
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
    });

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
    });

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
    });

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

    const authed = await guard.canActivate(context);

    expect(authed).toBeFalsy();
  });
});
