import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { OrganizationGuard } from './organization.guard';
import { MockContext, createMockContext } from '../../services/prisma/context';
import { OrganizationModule } from '../../modules/organization/organization.module';

describe('OrganizationGuard', () => {
  let guard: OrganizationGuard;
  let mockCtx: MockContext;

  beforeEach(async () => {
    mockCtx = createMockContext();
    const module: TestingModule = await Test.createTestingModule({
      imports: [OrganizationModule],
    }).compile();

    guard = module.get<OrganizationGuard>(OrganizationGuard);
    guard.ctx = mockCtx;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return false with no org id', async () => {
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
        body: {
          organizationId: 1,
        },
      }),
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

  it('should return true with auth as nonowner', async () => {
    const context = createMock<ExecutionContext>({
      getArgByIndex: () => ({
        user: {
          user: { id: 2, superAdmin: false },
        },
        params: {
          id: 1,
        },
        body: {
          organizationId: 1,
        },
      }),
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
        },
        body: {
          organizationId: 1,
        },
      }),
    });

    const authed = await guard.canActivate(context);

    expect(authed).toBeFalsy();
  });
});
