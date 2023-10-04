import { Test, TestingModule } from '@nestjs/testing';
import { UserConventionPermissionsController } from './user-convention-permissions.controller';

describe('UserConventionPermissionsController', () => {
  let controller: UserConventionPermissionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserConventionPermissionsController],
    }).compile();

    controller = module.get<UserConventionPermissionsController>(UserConventionPermissionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
