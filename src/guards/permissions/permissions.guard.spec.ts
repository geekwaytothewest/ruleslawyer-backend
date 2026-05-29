import { ExecutionContext } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { OrganizationPermissionsGuard } from './organization-permissions.guard';
import { ConventionPermissionsGuard } from './convention-permissions.guard';
import { ConventionCreatePermissionsGuard } from './convention-create-permissions.guard';
import { OrganizationPermissionsSelfUpdateGuard } from './organization-permissions-self-update.guard';
import { ConventionPermissionsSelfUpdateGuard } from './convention-permissions-self-update.guard';
import { OrganizationService } from '../../services/organization/organization.service';
import { ConventionService } from '../../services/convention/convention.service';
import { UserConventionPermissionsService } from '../../services/user-convention-permissions/user-convention-permissions.service';
import { UserOrganizationPermissionsService } from '../../services/user-organization-permissions/user-organization-permissions.service';
import { PrismaService } from '../../services/prisma/prisma.service';

// Builds an ExecutionContext whose getArgByIndex(0) returns the given request-like object.
const contextFor = (request: any): ExecutionContext =>
  createMock<ExecutionContext>({
    getArgByIndex: () => request,
  });

const ownerOrg = {
  id: 10,
  ownerId: 1,
  name: 'Geekway to the Test',
  users: [],
};

const adminOrg = {
  id: 10,
  ownerId: 1,
  name: 'Geekway to the Test',
  users: [{ id: 1, userId: 2, admin: true }],
};

const memberOrg = {
  id: 10,
  ownerId: 1,
  name: 'Geekway to the Test',
  users: [{ id: 1, userId: 2, admin: false }],
};

describe('OrganizationPermissionsGuard', () => {
  let guard: OrganizationPermissionsGuard;
  let organizationService: jest.Mocked<OrganizationService>;
  let prismaService: jest.Mocked<PrismaService>;
  // The org guard reads the permission record via the injected PrismaService directly.
  let permissionFindUnique: jest.Mock;

  beforeEach(() => {
    organizationService = createMock<OrganizationService>();
    prismaService = createMock<PrismaService>();
    permissionFindUnique = prismaService.userOrganizationPermissions
      .findUnique as unknown as jest.Mock;
    guard = new OrganizationPermissionsGuard(organizationService, prismaService);
  });

  // params.id is the permission-record id; the org is resolved from that record.
  const permission = { id: 5, userId: 2, organizationId: 10 };

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('returns false with no user', async () => {
    expect(await guard.canActivate(contextFor({}))).toBeFalsy();
  });

  it('returns true for a superAdmin', async () => {
    const context = contextFor({
      user: { user: { id: 99, superAdmin: true } },
    });
    expect(await guard.canActivate(context)).toBeTruthy();
  });

  it('returns false when params.id is missing', async () => {
    const context = contextFor({
      user: { user: { id: 1, superAdmin: false } },
      params: {},
    });
    expect(await guard.canActivate(context)).toBeFalsy();
  });

  it('returns false when the permission record is not found', async () => {
    permissionFindUnique.mockResolvedValue(null);
    const context = contextFor({
      user: { user: { id: 1, superAdmin: false } },
      params: { id: 5 },
    });
    expect(await guard.canActivate(context)).toBeFalsy();
  });

  it('returns true for the org owner', async () => {
    permissionFindUnique.mockResolvedValue(permission as any);
    organizationService.organizationWithUsers.mockResolvedValue(ownerOrg);
    const context = contextFor({
      user: { user: { id: 1, superAdmin: false } },
      params: { id: 5 },
    });
    expect(await guard.canActivate(context)).toBeTruthy();
  });

  it('returns true for an org admin', async () => {
    permissionFindUnique.mockResolvedValue(permission as any);
    organizationService.organizationWithUsers.mockResolvedValue(adminOrg);
    const context = contextFor({
      user: { user: { id: 2, superAdmin: false } },
      params: { id: 5 },
    });
    expect(await guard.canActivate(context)).toBeTruthy();
  });

  it('returns false for a non-admin member', async () => {
    permissionFindUnique.mockResolvedValue(permission as any);
    organizationService.organizationWithUsers.mockResolvedValue(memberOrg);
    const context = contextFor({
      user: { user: { id: 2, superAdmin: false } },
      params: { id: 5 },
    });
    expect(await guard.canActivate(context)).toBeFalsy();
  });

  it('returns false when the user has no membership', async () => {
    permissionFindUnique.mockResolvedValue(permission as any);
    organizationService.organizationWithUsers.mockResolvedValue(ownerOrg);
    const context = contextFor({
      user: { user: { id: 2, superAdmin: false } },
      params: { id: 5 },
    });
    expect(await guard.canActivate(context)).toBeFalsy();
  });
});

describe('ConventionPermissionsGuard', () => {
  let guard: ConventionPermissionsGuard;
  let organizationService: jest.Mocked<OrganizationService>;
  let conventionService: jest.Mocked<ConventionService>;
  let userConventionPermissionsService: jest.Mocked<UserConventionPermissionsService>;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(() => {
    organizationService = createMock<OrganizationService>();
    conventionService = createMock<ConventionService>();
    userConventionPermissionsService =
      createMock<UserConventionPermissionsService>();
    prismaService = createMock<PrismaService>();
    guard = new ConventionPermissionsGuard(
      organizationService,
      conventionService,
      userConventionPermissionsService,
      prismaService,
    );
  });

  // params.id is the convention-permission id -> conventionId -> organizationId.
  const permission = { id: 7, userId: 2, conventionId: 20 };
  const convention = { id: 20, organizationId: 10 };

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('returns false with no user', async () => {
    expect(await guard.canActivate(contextFor({}))).toBeFalsy();
  });

  it('returns true for a superAdmin', async () => {
    const context = contextFor({
      user: { user: { id: 99, superAdmin: true } },
    });
    expect(await guard.canActivate(context)).toBeTruthy();
  });

  it('returns false when params.id is missing', async () => {
    const context = contextFor({
      user: { user: { id: 1, superAdmin: false } },
      params: {},
    });
    expect(await guard.canActivate(context)).toBeFalsy();
  });

  it('returns false when the permission record is not found', async () => {
    userConventionPermissionsService.getPermission.mockResolvedValue(null);
    const context = contextFor({
      user: { user: { id: 1, superAdmin: false } },
      params: { id: 7 },
    });
    expect(await guard.canActivate(context)).toBeFalsy();
  });

  it('returns true for the org owner', async () => {
    userConventionPermissionsService.getPermission.mockResolvedValue(
      permission as any,
    );
    conventionService.convention.mockResolvedValue(convention as any);
    organizationService.organizationWithUsers.mockResolvedValue(ownerOrg);
    const context = contextFor({
      user: { user: { id: 1, superAdmin: false } },
      params: { id: 7 },
    });
    expect(await guard.canActivate(context)).toBeTruthy();
  });

  it('returns true for an org admin', async () => {
    userConventionPermissionsService.getPermission.mockResolvedValue(
      permission as any,
    );
    conventionService.convention.mockResolvedValue(convention as any);
    organizationService.organizationWithUsers.mockResolvedValue(adminOrg);
    const context = contextFor({
      user: { user: { id: 2, superAdmin: false } },
      params: { id: 7 },
    });
    expect(await guard.canActivate(context)).toBeTruthy();
  });

  it('returns false for a non-admin member', async () => {
    userConventionPermissionsService.getPermission.mockResolvedValue(
      permission as any,
    );
    conventionService.convention.mockResolvedValue(convention as any);
    organizationService.organizationWithUsers.mockResolvedValue(memberOrg);
    const context = contextFor({
      user: { user: { id: 2, superAdmin: false } },
      params: { id: 7 },
    });
    expect(await guard.canActivate(context)).toBeFalsy();
  });
});

describe('ConventionCreatePermissionsGuard', () => {
  let guard: ConventionCreatePermissionsGuard;
  let organizationService: jest.Mocked<OrganizationService>;
  let conventionService: jest.Mocked<ConventionService>;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(() => {
    organizationService = createMock<OrganizationService>();
    conventionService = createMock<ConventionService>();
    prismaService = createMock<PrismaService>();
    guard = new ConventionCreatePermissionsGuard(
      organizationService,
      conventionService,
      prismaService,
    );
  });

  // The convention comes from body.conventionId (no permission record exists yet).
  const convention = { id: 20, organizationId: 10 };

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('returns false with no user', async () => {
    expect(await guard.canActivate(contextFor({}))).toBeFalsy();
  });

  it('returns true for a superAdmin', async () => {
    const context = contextFor({
      user: { user: { id: 99, superAdmin: true } },
    });
    expect(await guard.canActivate(context)).toBeTruthy();
  });

  it('returns false when body.conventionId is missing', async () => {
    const context = contextFor({
      user: { user: { id: 1, superAdmin: false } },
      body: {},
    });
    expect(await guard.canActivate(context)).toBeFalsy();
  });

  it('returns false when the convention is not found', async () => {
    conventionService.convention.mockResolvedValue(null);
    const context = contextFor({
      user: { user: { id: 1, superAdmin: false } },
      body: { conventionId: 20 },
    });
    expect(await guard.canActivate(context)).toBeFalsy();
  });

  it('returns true for the org owner', async () => {
    conventionService.convention.mockResolvedValue(convention as any);
    organizationService.organizationWithUsers.mockResolvedValue(ownerOrg);
    const context = contextFor({
      user: { user: { id: 1, superAdmin: false } },
      body: { conventionId: 20 },
    });
    expect(await guard.canActivate(context)).toBeTruthy();
  });

  it('returns true for an org admin', async () => {
    conventionService.convention.mockResolvedValue(convention as any);
    organizationService.organizationWithUsers.mockResolvedValue(adminOrg);
    const context = contextFor({
      user: { user: { id: 2, superAdmin: false } },
      body: { conventionId: 20 },
    });
    expect(await guard.canActivate(context)).toBeTruthy();
  });

  it('returns false for a non-admin member', async () => {
    conventionService.convention.mockResolvedValue(convention as any);
    organizationService.organizationWithUsers.mockResolvedValue(memberOrg);
    const context = contextFor({
      user: { user: { id: 2, superAdmin: false } },
      body: { conventionId: 20 },
    });
    expect(await guard.canActivate(context)).toBeFalsy();
  });
});

describe('OrganizationPermissionsSelfUpdateGuard', () => {
  let guard: OrganizationPermissionsSelfUpdateGuard;
  let userOrganizationPermissionsService: jest.Mocked<UserOrganizationPermissionsService>;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(() => {
    userOrganizationPermissionsService =
      createMock<UserOrganizationPermissionsService>();
    prismaService = createMock<PrismaService>();
    guard = new OrganizationPermissionsSelfUpdateGuard(
      userOrganizationPermissionsService,
      prismaService,
    );
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('returns false when params.id is missing', async () => {
    const context = contextFor({
      user: { user: { id: 1, superAdmin: false } },
      params: {},
    });
    expect(await guard.canActivate(context)).toBeFalsy();
  });

  it('returns false with no user', async () => {
    const context = contextFor({ params: { id: 5 } });
    expect(await guard.canActivate(context)).toBeFalsy();
  });

  it('returns true for a superAdmin', async () => {
    const context = contextFor({
      user: { user: { id: 99, superAdmin: true } },
      params: { id: 5 },
    });
    expect(await guard.canActivate(context)).toBeTruthy();
  });

  it('returns false when the permission record is not found', async () => {
    userOrganizationPermissionsService.getPermission.mockResolvedValue(null);
    const context = contextFor({
      user: { user: { id: 1, superAdmin: false } },
      params: { id: 5 },
    });
    expect(await guard.canActivate(context)).toBeFalsy();
  });

  it('returns false when editing your own permission', async () => {
    userOrganizationPermissionsService.getPermission.mockResolvedValue({
      id: 5,
      userId: 1,
    } as any);
    const context = contextFor({
      user: { user: { id: 1, superAdmin: false } },
      params: { id: 5 },
    });
    expect(await guard.canActivate(context)).toBeFalsy();
  });

  it('returns true when editing someone else', async () => {
    userOrganizationPermissionsService.getPermission.mockResolvedValue({
      id: 5,
      userId: 2,
    } as any);
    const context = contextFor({
      user: { user: { id: 1, superAdmin: false } },
      params: { id: 5 },
    });
    expect(await guard.canActivate(context)).toBeTruthy();
  });
});

describe('ConventionPermissionsSelfUpdateGuard', () => {
  let guard: ConventionPermissionsSelfUpdateGuard;
  let userConventionPermissionsService: jest.Mocked<UserConventionPermissionsService>;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(() => {
    userConventionPermissionsService =
      createMock<UserConventionPermissionsService>();
    prismaService = createMock<PrismaService>();
    guard = new ConventionPermissionsSelfUpdateGuard(
      userConventionPermissionsService,
      prismaService,
    );
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('returns false when params.id is missing', async () => {
    const context = contextFor({
      user: { user: { id: 1, superAdmin: false } },
      params: {},
    });
    expect(await guard.canActivate(context)).toBeFalsy();
  });

  it('returns false with no user', async () => {
    const context = contextFor({ params: { id: 5 } });
    expect(await guard.canActivate(context)).toBeFalsy();
  });

  it('returns true for a superAdmin', async () => {
    const context = contextFor({
      user: { user: { id: 99, superAdmin: true } },
      params: { id: 5 },
    });
    expect(await guard.canActivate(context)).toBeTruthy();
  });

  it('returns false when the permission record is not found', async () => {
    userConventionPermissionsService.getPermission.mockResolvedValue(null);
    const context = contextFor({
      user: { user: { id: 1, superAdmin: false } },
      params: { id: 5 },
    });
    expect(await guard.canActivate(context)).toBeFalsy();
  });

  it('returns false when editing your own permission', async () => {
    userConventionPermissionsService.getPermission.mockResolvedValue({
      id: 5,
      userId: 1,
    } as any);
    const context = contextFor({
      user: { user: { id: 1, superAdmin: false } },
      params: { id: 5 },
    });
    expect(await guard.canActivate(context)).toBeFalsy();
  });

  it('returns true when editing someone else', async () => {
    userConventionPermissionsService.getPermission.mockResolvedValue({
      id: 5,
      userId: 2,
    } as any);
    const context = contextFor({
      user: { user: { id: 1, superAdmin: false } },
      params: { id: 5 },
    });
    expect(await guard.canActivate(context)).toBeTruthy();
  });
});
