import { MockContext, createMockContext } from '../../services/prisma/context';
import { CopyGuard } from './copy.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { CopyService } from '../../services/copy/copy.service';
import { PrismaService } from '../../services/prisma/prisma.service';
import { OrganizationService } from '../../services/organization/organization.service';
import { ExecutionContext } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';

describe('CopyGuard', () => {
  let guard: CopyGuard;
  let mockCtx: MockContext;

  beforeEach(async () => {
    mockCtx = createMockContext();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [],
      providers: [CopyGuard, PrismaService, CopyService, OrganizationService],
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
      barcode: '*00001*',
      barcodeNumber: 1,
      collectionId: 1,
      collection: {
        id: 1,
        name: 'Test Collection',
      },
    };

    const orgQuery = {
      id: 1,
      name: 'Test Organization',
      ownerId: 1,
      users: [
        {
          id: 2,
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
      barcode: '*00001*',
      barcodeNumber: 1,
      collectionId: 1,
      collection: {
        id: 1,
        name: 'Test Collection',
        organizationId: 1,
      },
    };

    const orgQuery = {
      id: 1,
      name: 'Test Organization',
      ownerId: 1,
      users: [
        {
          id: 2,
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
          user: { id: 1, superAdmin: true },
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
      barcode: '*00001*',
      barcodeNumber: 1,
      collectionId: 1,
      collection: {
        id: 1,
        name: 'Test Collection',
      },
    };

    mockCtx.prisma.copy.findUnique.mockResolvedValue(query);

    const authed = await guard.canActivate(context);

    expect(authed).toBeFalsy();
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
      barcode: '*00001*',
      barcodeNumber: 1,
      collectionId: 1,
      collection: {
        id: 1,
        name: 'Test Collection',
      },
    };

    const orgQuery = {
      id: 1,
      name: 'Test Organization',
      ownerId: 1,
      users: [
        {
          id: 2,
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
