import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../../services/user/user.service';
import { User } from '@prisma/client';
import { PrismaService } from '../../services/prisma/prisma.service';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        PrismaService,
        {
          provide: UserService,
          useValue: {
            user: jest.fn().mockImplementation(
              () =>
                <User>{
                  id: 1,
                },
            ),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUsedById', () => {
    it('should get a user', async () => {
      const user = await controller.getUserById('1');

      expect(user.id).toBe(1);
    });
  });
});
