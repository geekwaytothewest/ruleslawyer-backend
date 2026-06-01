import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { OrganizationBggGuard } from './organization-bgg.guard';
import { MockContext, createMockContext } from '../../services/prisma/context';
import { OrganizationModule } from '../../modules/organization/organization.module';

describe('OrganizationBggGuard', () => {
  let guard: OrganizationBggGuard;
  let mockCtx: MockContext;

  beforeEach(async () => {
    mockCtx = createMockContext();
    const module: TestingModule = await Test.createTestingModule({
      imports: [OrganizationModule],
    }).compile();

    guard = module.get<OrganizationBggGuard>(OrganizationBggGuard);
    guard.ctx = mockCtx;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return false with no org id', async () => {
    const context = createMock<ExecutionContext>({
      getArgByIndex: () => ({}),
    });

    expect(await guard.canActivate(context)).toBeFalsy();
    // No org lookup should happen when there is no id to resolve.
    expect(mockCtx.prisma.organization.findUnique).not.toHaveBeenCalled();
  });

  it('should return true when org has BGG support enabled (params.orgId)', async () => {
    const context = createMock<ExecutionContext>({
      getArgByIndex: () => ({
        params: { orgId: 1 },
      }),
    });

    mockCtx.prisma.organization.findUnique.mockResolvedValue({
      id: 1,
      ownerId: 1,
      name: 'Geekway to the Test',
      enableBggSupport: true,
    } as never);

    expect(await guard.canActivate(context)).toBeTruthy();
    expect(mockCtx.prisma.organization.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it('should return false when org has BGG support disabled', async () => {
    const context = createMock<ExecutionContext>({
      getArgByIndex: () => ({
        params: { orgId: 1 },
      }),
    });

    mockCtx.prisma.organization.findUnique.mockResolvedValue({
      id: 1,
      ownerId: 1,
      name: 'Geekway to the Test',
      enableBggSupport: false,
    } as never);

    expect(await guard.canActivate(context)).toBeFalsy();
  });

  it('should return false when the org does not exist', async () => {
    const context = createMock<ExecutionContext>({
      getArgByIndex: () => ({
        params: { orgId: 99 },
      }),
    });

    mockCtx.prisma.organization.findUnique.mockResolvedValue(null as never);

    expect(await guard.canActivate(context)).toBeFalsy();
  });

  it('should fall back to params.orgId then body.organizationId', async () => {
    mockCtx.prisma.organization.findUnique.mockResolvedValue({
      id: 1,
      enableBggSupport: true,
    } as never);

    const orgIdContext = createMock<ExecutionContext>({
      getArgByIndex: () => ({
        params: { orgId: 1 },
      }),
    });
    expect(await guard.canActivate(orgIdContext)).toBeTruthy();
    expect(mockCtx.prisma.organization.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });

    const bodyContext = createMock<ExecutionContext>({
      getArgByIndex: () => ({
        params: {},
        body: { organizationId: 1 },
      }),
    });
    expect(await guard.canActivate(bodyContext)).toBeTruthy();
  });

  it('should ignore params.id and resolve the org from params.orgId', async () => {
    const context = createMock<ExecutionContext>({
      getArgByIndex: () => ({
        params: { id: 1, orgId: 2 },
        body: { organizationId: 3 },
      }),
    });

    mockCtx.prisma.organization.findUnique.mockResolvedValue({
      id: 2,
      enableBggSupport: true,
    } as never);

    expect(await guard.canActivate(context)).toBeTruthy();
    // The guard gates on the organization, not the game (params.id), so the
    // org comes from params.orgId (2) — not params.id (1) or body (3).
    expect(mockCtx.prisma.organization.findUnique).toHaveBeenCalledWith({
      where: { id: 2 },
    });
  });

  it('should prefer params.orgId over body.organizationId when params.id is absent', async () => {
    const context = createMock<ExecutionContext>({
      getArgByIndex: () => ({
        params: { orgId: 2 },
        body: { organizationId: 3 },
      }),
    });

    mockCtx.prisma.organization.findUnique.mockResolvedValue({
      id: 2,
      enableBggSupport: true,
    } as never);

    expect(await guard.canActivate(context)).toBeTruthy();
    // params.orgId wins over body.organizationId (3).
    expect(mockCtx.prisma.organization.findUnique).toHaveBeenCalledWith({
      where: { id: 2 },
    });
  });

  it('should coerce a string org id to a number for the lookup', async () => {
    const context = createMock<ExecutionContext>({
      getArgByIndex: () => ({
        params: { orgId: '1' },
      }),
    });

    mockCtx.prisma.organization.findUnique.mockResolvedValue({
      id: 1,
      enableBggSupport: true,
    } as never);

    expect(await guard.canActivate(context)).toBeTruthy();
    expect(mockCtx.prisma.organization.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });
});
