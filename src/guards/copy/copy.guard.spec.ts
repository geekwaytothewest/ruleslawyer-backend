import { MockContext, createMockContext } from '../../services/prisma/context';
import { CopyGuard } from './copy.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { CopyModule } from '../../modules/copy/copy.module';

describe('CopyGuard', () => {
  let guard: CopyGuard;
  let mockCtx: MockContext;

  beforeEach(async () => {
    mockCtx = createMockContext();
    const module: TestingModule = await Test.createTestingModule({
      imports: [CopyModule],
    }).compile();

    guard = module.get<CopyGuard>(CopyGuard);
    guard.ctx = mockCtx;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return false with no copy id', async () => {
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
          user: { id: 2, superAdmin: false },
        },
        params: {
          id: 1,
        },
      }),
    });

    const query = {
      id: 1,
      gameId: 1,
      dateAdded: new Date(),
      dateRetired: null,
      winnable: false,
      winnerId: null,
      coverArtOverride: null,
      bggVersionOverride: null,
      barcode: '*00001*',
      barcodeLabel: '1',
      collectionId: 1,
      comments: null,
      collection: {
        id: 1,
        name: 'Test Collection',
      },
      organizationId: 1,
    };

    const orgQuery = {
      id: 1,
      name: 'Test Organization',
      ownerId: 1,
      enableBggSupport: false,
      users: [
        {
          id: 1,
          userId: 2,
          admin: true,
        },
      ],
    };

    mockCtx.prisma.copy.findUnique.mockResolvedValue(query);
    mockCtx.prisma.organization.findUnique.mockResolvedValue(orgQuery);

    const authed = await guard.canActivate(context);

    expect(authed).toBeTruthy();
  });

  it('should return true with org owner', async () => {
    const context = createMock<ExecutionContext>({
      getArgByIndex: () => ({
        user: {
          user: { id: 1, superAdmin: false },
        },
        params: {
          id: 1,
        },
      }),
    });

    const query = {
      id: 1,
      gameId: 1,
      dateAdded: new Date(),
      dateRetired: null,
      winnable: false,
      winnerId: null,
      coverArtOverride: null,
      bggVersionOverride: null,
      barcode: '*00001*',
      barcodeLabel: '1',
      collectionId: 1,
      comments: null,
      collection: {
        id: 1,
        name: 'Test Collection',
        organizationId: 1,
      },
      organizationId: 1,
    };

    const orgQuery = {
      id: 1,
      name: 'Test Organization',
      ownerId: 1,
      enableBggSupport: false,
      users: [
        {
          id: 1,
          userId: 2,
          admin: true,
        },
      ],
    };

    mockCtx.prisma.copy.findUnique.mockResolvedValue(query);
    mockCtx.prisma.organization.findUnique.mockResolvedValue(orgQuery);

    const authed = await guard.canActivate(context);

    expect(authed).toBeTruthy();
  });

  it('should return false with bad user', async () => {
    const context = createMock<ExecutionContext>({
      getArgByIndex: () => ({
        user: {
          user: { id: 1 },
        },
        params: {
          id: 1,
        },
      }),
    });

    const query = {
      id: 1,
      gameId: 1,
      dateAdded: new Date(),
      dateRetired: null,
      winnable: false,
      winnerId: null,
      coverArtOverride: null,
      bggVersionOverride: null,
      barcode: '*00001*',
      barcodeLabel: '1',
      collectionId: 1,
      comments: null,
      collection: {
        id: 1,
        name: 'Test Collection',
      },
      organizationId: 1,
    };

    mockCtx.prisma.copy.findUnique.mockResolvedValue(query);

    const authed = await guard.canActivate(context);

    expect(authed).toBeFalsy();
  });

  it('should return true for a super admin', async () => {
    const context = createMock<ExecutionContext>({
      getArgByIndex: () => ({
        user: { user: { id: 9, superAdmin: true } },
        params: { id: 1 },
      }),
    });

    mockCtx.prisma.copy.findUnique.mockResolvedValue({
      id: 1,
      organizationId: 1,
      collection: { id: 1, archived: false },
    } as any);

    const authed = await guard.canActivate(context);

    expect(authed).toBeTruthy();
  });

  it('should return false when the copy collection is archived', async () => {
    const context = createMock<ExecutionContext>({
      getArgByIndex: () => ({
        user: { user: { id: 9, superAdmin: true } },
        params: { id: 1 },
      }),
    });

    mockCtx.prisma.copy.findUnique.mockResolvedValue({
      id: 1,
      organizationId: 1,
      collection: { id: 1, archived: true },
    } as any);

    const authed = await guard.canActivate(context);

    expect(authed).toBeFalsy();
  });

  it('should return false when the copy is not found', async () => {
    const context = createMock<ExecutionContext>({
      getArgByIndex: () => ({
        user: { user: { id: 9, superAdmin: true } },
        params: { id: 1 },
      }),
    });

    mockCtx.prisma.copy.findUnique.mockResolvedValue(null);

    const authed = await guard.canActivate(context);

    expect(authed).toBeFalsy();
  });

  it('should fall back to the copyId param when id is absent', async () => {
    const context = createMock<ExecutionContext>({
      getArgByIndex: () => ({
        user: { user: { id: 9, superAdmin: true } },
        params: { copyId: 5 },
      }),
    });

    mockCtx.prisma.copy.findUnique.mockResolvedValue({
      id: 5,
      organizationId: 1,
      collection: { id: 1, archived: false },
    } as any);

    const authed = await guard.canActivate(context);

    expect(authed).toBeTruthy();
    expect(mockCtx.prisma.copy.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 5 } }),
    );
  });

  // copyId resolves from params.id, falling back to params.copyId. Supply both
  // with conflicting values and assert the lookup used the higher-priority one.
  it('prefers params.id over params.copyId', async () => {
    const context = createMock<ExecutionContext>({
      getArgByIndex: () => ({
        user: { user: { id: 9, superAdmin: true } },
        params: { id: 1, copyId: 5 },
      }),
    });

    mockCtx.prisma.copy.findUnique.mockResolvedValue({
      id: 1,
      organizationId: 1,
      collection: { id: 1, archived: false },
    } as any);

    const authed = await guard.canActivate(context);

    expect(authed).toBeTruthy();
    expect(mockCtx.prisma.copy.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 1 } }),
    );
  });

  it('should return false when no copyId and no barcodeLabel are provided', async () => {
    const context = createMock<ExecutionContext>({
      getArgByIndex: () => ({
        user: { user: { id: 9, superAdmin: true } },
        params: { orgId: 1 },
      }),
    });

    const authed = await guard.canActivate(context);

    expect(authed).toBeFalsy();
  });

  it('should return false when a barcodeLabel is given without an orgId', async () => {
    const context = createMock<ExecutionContext>({
      getArgByIndex: () => ({
        user: { user: { id: 9, superAdmin: true } },
        params: { oldBarcodeLabel: 'ABC' },
      }),
    });

    const authed = await guard.canActivate(context);

    expect(authed).toBeFalsy();
  });

  it('should resolve the copy by barcodeLabel and orgId', async () => {
    const context = createMock<ExecutionContext>({
      getArgByIndex: () => ({
        user: { user: { id: 9, superAdmin: true } },
        params: { oldBarcodeLabel: 'ABC', orgId: 1 },
      }),
    });

    mockCtx.prisma.copy.findUnique.mockResolvedValue({
      id: 7,
      organizationId: 1,
      collection: { id: 1, archived: false },
    } as any);

    const authed = await guard.canActivate(context);

    expect(authed).toBeTruthy();
    expect(mockCtx.prisma.copy.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          organizationId_barcodeLabel: {
            barcodeLabel: 'ABC',
            organizationId: 1,
          },
        },
      }),
    );
  });

  it('should return false after everything', async () => {
    const context = createMock<ExecutionContext>({
      getArgByIndex: () => ({
        user: {
          user: { id: 3, superAdmin: false },
        },
        params: {
          id: 1,
        },
      }),
    });

    const query = {
      id: 1,
      gameId: 1,
      dateAdded: new Date(),
      dateRetired: null,
      winnable: false,
      winnerId: null,
      coverArtOverride: null,
      bggVersionOverride: null,
      barcode: '*00001*',
      barcodeLabel: '1',
      collectionId: 1,
      comments: null,
      collection: {
        id: 1,
        name: 'Test Collection',
      },
      organizationId: 1,
    };

    const orgQuery = {
      id: 1,
      name: 'Test Organization',
      ownerId: 1,
      enableBggSupport: false,
      users: [
        {
          id: 1,
          userId: 1,
          admin: true,
        },
      ],
    };

    mockCtx.prisma.copy.findUnique.mockResolvedValue(query);
    mockCtx.prisma.organization.findUnique.mockResolvedValue(orgQuery);

    const authed = await guard.canActivate(context);

    expect(authed).toBeFalsy();
  });
});
