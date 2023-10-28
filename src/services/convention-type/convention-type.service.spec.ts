import { Test, TestingModule } from '@nestjs/testing';
import { ConventionTypeService } from './convention-type.service';
import { Context, MockContext, createMockContext } from '../prisma/context';

describe('ConventionTypeService', () => {
  let service: ConventionTypeService;
  let mockCtx: MockContext;
  let ctx: Context;

  beforeEach(async () => {
    mockCtx = createMockContext();
    ctx = mockCtx as unknown as Context;
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConventionTypeService],
    }).compile();

    service = module.get<ConventionTypeService>(ConventionTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('conventionType', () => {
    it('should return a conventionType', async () => {
      mockCtx.prisma.conventionType.findUnique.mockResolvedValue({
        id: 1,
        name: 'Geekway to the West',
        organizationId: 1,
        description: null,
        logo: null,
        logoSquare: null,
        icon: null,
        content: null,
      });

      const conventionType = await service.conventionType(
        {
          id: 1,
        },
        ctx,
      );

      expect(conventionType?.id).toBe(1);
    });
  });

  describe('createConventionType', () => {
    it('should create a convention type', async () => {
      const conType = {
        id: 1,
        name: 'Geekway to the West',
        organizationId: 1,
        description: null,
        logo: null,
        logoSquare: null,
        icon: null,
        content: null,
      };

      mockCtx.prisma.conventionType.create.mockResolvedValue(conType);

      const conventionType = await service.createConventionType(
        {
          name: 'Geekway to the West',
          organization: {
            connect: {
              id: 1,
            },
          },
        },
        ctx,
      );

      expect(conventionType.id).toBe(1);
    });
  });
});
