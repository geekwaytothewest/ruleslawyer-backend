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
});
