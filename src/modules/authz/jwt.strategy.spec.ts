import { Test, TestingModule } from '@nestjs/testing';
import { MockContext, createMockContext } from '../../services/prisma/context';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from '../../services/prisma/prisma.service';
import { UserService } from '../../services/user/user.service';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let mockCtx: MockContext;

  beforeEach(async () => {
    mockCtx = createMockContext();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [],
      providers: [JwtStrategy, PrismaService, UserService],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    strategy.ctx = mockCtx;
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should fail with unauthorized', async () => {
      expect(strategy.validate({})).rejects.toThrow(UnauthorizedException);
    });

    it('should do the needful', async () => {
      mockCtx.prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'test@geekway.com',
        name: 'Test User',
        username: 'testuser',
        superAdmin: false,
        pronounsId: 1,
      });

      const payload = await strategy.validate({
        user_email: 'test@geekway.com',
      });

      expect(payload.user.email).toBe('test@geekway.com');
    });

    it('should do the needful again', async () => {
      mockCtx.prisma.user.findUnique.mockResolvedValue(null);

      mockCtx.prisma.user.create.mockResolvedValue({
        id: 1,
        email: 'test@geekway.com',
        name: 'Test User',
        username: 'testuser',
        superAdmin: false,
        pronounsId: 1,
      });

      mockCtx.prisma.user.update.mockResolvedValue({
        id: 1,
        email: 'test@geekway.com',
        name: 'Test User',
        username: 'testuser',
        superAdmin: true,
        pronounsId: 1,
      });

      const payloadReturn = await strategy.validate({
        user_email: 'test@geekway.com',
      });

      expect(payloadReturn.user.superAdmin).toBeTruthy();
    });

    it('should do the needful yet again', async () => {
      mockCtx.prisma.user.findUnique.mockResolvedValue(null);
      mockCtx.prisma.user.create.mockResolvedValue({
        id: 2,
        email: 'test@geekway.com',
        name: 'Test User',
        username: 'testuser',
        superAdmin: false,
        pronounsId: 1,
      });

      const payload = await strategy.validate({
        user_email: 'test@geekway.com',
      });

      expect(payload.user.email).toBe('test@geekway.com');
    });
  });
});
