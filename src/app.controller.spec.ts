import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserService } from './services/user/user.service';
import { PrismaService } from './services/prisma/prisma.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: UserService,
          useValue: {
            getUserCount: jest.fn().mockImplementation(() => 0),
          },
        },
        PrismaService,
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('status', () => {
    it('should return "initialized"', async () => {
      expect(await appController.status()).toBe('initialized');
    });
  });
});
