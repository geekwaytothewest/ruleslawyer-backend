import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationService } from './organization.service';
import { PrismaService } from '../prisma/prisma.service';
import { Context, MockContext, createMockContext } from '../prisma/context';

describe('OrganizationService', () => {
  let service: OrganizationService;
  let mockCtx: MockContext;
  let ctx: Context;

  beforeEach(async () => {
    mockCtx = createMockContext();
    ctx = mockCtx as unknown as Context;
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrganizationService, PrismaService],
    }).compile();

    service = module.get<OrganizationService>(OrganizationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('organization', () => {
    it('should create an organization', async () => {
      mockCtx.prisma.organization.findUnique.mockResolvedValue({
        id: 1,
        name: 'Geekway to the Testing',
        ownerId: 1,
        enableBggSupport: false,
      });

      const org = await service.organization(
        {
          id: 1,
        },
        ctx,
      );

      expect(org?.id).toBe(1);
    });
  });

  describe('organizationWithUsers', () => {
    it('should get an organization with users', async () => {
      const organization = {
        id: 1,
        name: 'Geekway to the Testing',
        ownerId: 1,
        enableBggSupport: false,
        users: [
          {
            id: 1,
            name: 'Test User',
          },
        ],
      };

      mockCtx.prisma.organization.findUnique.mockResolvedValue(organization);

      const org = await service.organizationWithUsers(
        {
          id: 1,
        },
        ctx,
      );

      expect(org?.users.length).toBe(1);
    });
  });

  describe('organizationWithCollections', () => {
    it('should get an organization with collections', async () => {
      const organization = {
        id: 1,
        name: 'Geekway to the Testing',
        ownerId: 1,
        enableBggSupport: false,
        collections: [
          {
            id: 1,
            name: 'Test Collection',
          },
        ],
      };

      mockCtx.prisma.organization.findUnique.mockResolvedValue(organization);

      const org = await service.organizationWithCollections(
        {
          id: 1,
        },
        ctx,
      );

      expect(org?.collections.length).toBe(1);
    });
  });

  describe('allOrganizations', () => {
    it('should return every organization', async () => {
      mockCtx.prisma.organization.findMany.mockResolvedValue([
        { id: 1, name: 'A', ownerId: 1, enableBggSupport: false },
        { id: 2, name: 'B', ownerId: 2, enableBggSupport: false },
      ]);

      const orgs = await service.allOrganizations(ctx);

      expect(orgs?.length).toBe(2);
    });
  });

  describe('organizationByOwner', () => {
    it('should return organizations owned by the user', async () => {
      mockCtx.prisma.organization.findMany.mockResolvedValue([
        { id: 1, name: 'A', ownerId: 7, enableBggSupport: false },
      ]);

      const orgs = await service.organizationByOwner(7, ctx);

      expect(orgs.length).toBe(1);
      expect(mockCtx.prisma.organization.findMany).toHaveBeenCalledWith({
        where: { ownerId: 7 },
      });
    });
  });

  describe('createOrganization', () => {
    it('should create an organization with the given name and owner', async () => {
      mockCtx.prisma.organization.create.mockResolvedValue({
        id: 1,
        name: 'New Org',
        ownerId: 3,
        enableBggSupport: false,
      });

      const org = await service.createOrganization('New Org', 3, ctx);

      expect(org.id).toBe(1);
      expect(mockCtx.prisma.organization.create).toHaveBeenCalledWith({
        data: { name: 'New Org', ownerId: 3 },
      });
    });
  });
});
