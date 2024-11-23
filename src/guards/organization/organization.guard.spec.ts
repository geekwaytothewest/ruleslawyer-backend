import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { OrganizationWriteGuard } from './organization-write.guard';
import { OrganizationReadGuard } from './organization-read.guard';
import { MockContext, createMockContext } from '../../services/prisma/context';
import { OrganizationModule } from '../../modules/organization/organization.module';

describe('OrganizationGuard', () => {
  let readGuard: OrganizationReadGuard;
  let writeGuard: OrganizationWriteGuard;
  let mockCtx: MockContext;

  beforeEach(async () => {
    mockCtx = createMockContext();
    const module: TestingModule = await Test.createTestingModule({
      imports: [OrganizationModule],
    }).compile();

    readGuard = module.get<OrganizationReadGuard>(OrganizationWriteGuard);
    readGuard.ctx = mockCtx;

    writeGuard = module.get<OrganizationWriteGuard>(OrganizationWriteGuard);
    writeGuard.ctx = mockCtx;
  });

  it('should be defined', () => {
    expect(readGuard).toBeDefined();
    expect(writeGuard).toBeDefined();
  });

  it('should return false with no org id', async () => {
    const context = createMock<ExecutionContext>({
      getArgByIndex: () => ({}),
    });

    const authed = await readGuard.canActivate(context);

    expect(authed).toBeFalsy();

    const context2 = createMock<ExecutionContext>({
      getArgByIndex: () => ({}),
    });

    const authed2 = await writeGuard.canActivate(context2);

    expect(authed2).toBeFalsy();
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
          userId: 1,
          admin: true,
        },
      ],
    };
    mockCtx.prisma.organization.findUnique.mockResolvedValue(org);

    const authed = await readGuard.canActivate(context);

    expect(authed).toBeTruthy();

    const context2 = createMock<ExecutionContext>({
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

    const org2 = {
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
    mockCtx.prisma.organization.findUnique.mockResolvedValue(org2);

    const authed2 = await writeGuard.canActivate(context2);

    expect(authed2).toBeTruthy();
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
          id: 1,
          userId: 2,
          admin: true,
        },
      ],
    };
    mockCtx.prisma.organization.findUnique.mockResolvedValue(org);

    const authed = await readGuard.canActivate(context);

    expect(authed).toBeTruthy();

    const context2 = createMock<ExecutionContext>({
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

    const org2 = {
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
    mockCtx.prisma.organization.findUnique.mockResolvedValue(org2);

    const authed2 = await writeGuard.canActivate(context2);

    expect(authed2).toBeTruthy();
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

    const authed = await readGuard.canActivate(context);

    expect(authed).toBeFalsy();

    const context2 = createMock<ExecutionContext>({
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

    const authed2 = await writeGuard.canActivate(context2);

    expect(authed2).toBeFalsy();
  });
});
