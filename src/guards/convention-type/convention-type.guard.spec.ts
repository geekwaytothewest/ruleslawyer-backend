import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { MockContext, createMockContext } from '../../services/prisma/context';
import { ConventionTypeGuard } from './convention-type.guard';
import { ConventionTypeModule } from '../../modules/convention-type/convention-type.module';

const baseConType = {
  id: 1,
  organizationId: 1,
  name: 'Geekway to the West',
  description: null,
  logo: null,
  logoSquare: null,
  icon: null,
  content: null,
} as any;

const contextFor = (request: any) =>
  createMock<ExecutionContext>({
    getArgByIndex: () => request,
  });

describe('ConventionTypeGuard', () => {
  let guard: ConventionTypeGuard;
  let mockCtx: MockContext;

  beforeEach(async () => {
    mockCtx = createMockContext();
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConventionTypeModule],
    }).compile();

    guard = module.get<ConventionTypeGuard>(ConventionTypeGuard);
    guard.ctx = mockCtx;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return false with no user', async () => {
    const context = contextFor({ params: { id: 1 } });

    expect(await guard.canActivate(context)).toBeFalsy();
  });

  it('should return true for a superAdmin', async () => {
    const context = contextFor({
      user: { user: { id: 1, superAdmin: true } },
      params: { id: 1 },
    });

    expect(await guard.canActivate(context)).toBeTruthy();
  });

  it('should return false when the convention type is not found', async () => {
    const context = contextFor({
      user: { user: { id: 2, superAdmin: false } },
      params: { id: 999 },
    });

    mockCtx.prisma.conventionType.findUnique.mockResolvedValue(null);

    expect(await guard.canActivate(context)).toBeFalsy();
  });

  it('should return true for the organization owner', async () => {
    const context = contextFor({
      user: { user: { id: 2, superAdmin: false } },
      params: { id: 1 },
    });

    mockCtx.prisma.conventionType.findUnique.mockResolvedValue(baseConType);
    mockCtx.prisma.organization.findUnique.mockResolvedValue({
      id: 1,
      ownerId: 2,
      users: [],
    } as any);

    expect(await guard.canActivate(context)).toBeTruthy();
  });

  it('should return true for an organization admin', async () => {
    const context = contextFor({
      user: { user: { id: 2, superAdmin: false } },
      params: { id: 1 },
    });

    mockCtx.prisma.conventionType.findUnique.mockResolvedValue(baseConType);
    mockCtx.prisma.organization.findUnique.mockResolvedValue({
      id: 1,
      ownerId: 99,
      users: [{ id: 1, userId: 2, admin: true }],
    } as any);

    expect(await guard.canActivate(context)).toBeTruthy();
  });

  it('should return false for a non-admin organization user', async () => {
    const context = contextFor({
      user: { user: { id: 2, superAdmin: false } },
      params: { id: 1 },
    });

    mockCtx.prisma.conventionType.findUnique.mockResolvedValue(baseConType);
    mockCtx.prisma.organization.findUnique.mockResolvedValue({
      id: 1,
      ownerId: 99,
      users: [{ id: 1, userId: 2, admin: false }],
    } as any);

    expect(await guard.canActivate(context)).toBeFalsy();
  });

  it('should return false for an unrelated user', async () => {
    const context = contextFor({
      user: { user: { id: 2, superAdmin: false } },
      params: { id: 1 },
    });

    mockCtx.prisma.conventionType.findUnique.mockResolvedValue(baseConType);
    mockCtx.prisma.organization.findUnique.mockResolvedValue({
      id: 1,
      ownerId: 99,
      users: [{ id: 1, userId: 99, admin: true }],
    } as any);

    expect(await guard.canActivate(context)).toBeFalsy();
  });
});
