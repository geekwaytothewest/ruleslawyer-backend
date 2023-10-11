import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserService } from './services/user/user.service';
import { PrismaService } from './services/prisma/prisma.service';
import {
  Context,
  MockContext,
  createMockContext,
} from './services/prisma/context';
import { GatewayTimeoutException } from '@nestjs/common';

describe('AppController', () => {
  let appController: AppController;
  let mockCtx: MockContext;
  let ctx: Context;

  beforeEach(async () => {
    mockCtx = createMockContext();
    ctx = mockCtx as unknown as Context;
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, UserService, PrismaService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appController.ctx = ctx;
  });

  describe('status', () => {
    it('no users should return "initialized"', async () => {
      mockCtx.prisma.user.count.mockResolvedValueOnce(0);

      expect(await appController.status()).toBe('initialized');
    });

    it('some users should return "live"', async () => {
      mockCtx.prisma.user.count.mockResolvedValueOnce(1);

      expect(await appController.status()).toBe('live');
    });

    it('should throw an error', async () => {
      mockCtx.prisma.user.count.mockImplementation(() => {
        throw new GatewayTimeoutException();
      });

      expect(await appController.status()).toBe('no database connection');
    });
  });
});
