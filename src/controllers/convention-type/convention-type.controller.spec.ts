import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ConventionTypeController } from './convention-type.controller';
import { ConventionTypeService } from '../../services/convention-type/convention-type.service';
import { PrismaService } from '../../services/prisma/prisma.service';
import { JwtAuthGuard } from '../../guards/auth/auth.guard';
import { ConventionTypeGuard } from '../../guards/convention-type/convention-type.guard';
import {
  Context,
  MockContext,
  createMockContext,
} from '../../services/prisma/context';

describe('ConventionTypeController', () => {
  let controller: ConventionTypeController;
  let mockCtx: MockContext;
  let ctx: Context;

  const conventionType = {
    id: 1,
    name: 'Geekway to the West',
    organizationId: 1,
    description: null,
    logo: null,
    logoSquare: null,
    icon: null,
    content: null,
  };

  beforeEach(async () => {
    mockCtx = createMockContext();
    ctx = mockCtx as unknown as Context;
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConventionTypeController],
      providers: [
        ConventionTypeService,
        { provide: PrismaService, useValue: {} },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(ConventionTypeGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ConventionTypeController>(ConventionTypeController);
    controller.ctx = ctx;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getConventionType', () => {
    it('should return a convention type when found', async () => {
      mockCtx.prisma.conventionType.findUnique.mockResolvedValue(
        conventionType,
      );

      const result = await controller.getConventionType('1');

      expect(result?.id).toBe(1);
      expect(mockCtx.prisma.conventionType.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should reject with NotFoundException when none is found', async () => {
      mockCtx.prisma.conventionType.findUnique.mockResolvedValue(null);

      await expect(controller.getConventionType('999')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('should reject with NotFoundException when the id is not numeric', async () => {
      await expect(
        controller.getConventionType('not-a-number'),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(mockCtx.prisma.conventionType.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('updateConventionType', () => {
    it('should update and return the convention type', async () => {
      const updated = { ...conventionType, name: 'Geekway to the Testing' };
      mockCtx.prisma.conventionType.update.mockResolvedValue(updated);

      const result = await controller.updateConventionType('1', {
        name: 'Geekway to the Testing',
      });

      expect(result?.name).toBe('Geekway to the Testing');
      expect(mockCtx.prisma.conventionType.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Geekway to the Testing' },
      });
    });

    it('should reject with NotFoundException when the update returns nothing', async () => {
      mockCtx.prisma.conventionType.update.mockResolvedValue(
        null as unknown as typeof conventionType,
      );

      await expect(
        controller.updateConventionType('999', { name: 'Nope' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should reject with NotFoundException when the id is not numeric', async () => {
      await expect(
        controller.updateConventionType('not-a-number', { name: 'Nope' }),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(mockCtx.prisma.conventionType.update).not.toHaveBeenCalled();
    });
  });
});
