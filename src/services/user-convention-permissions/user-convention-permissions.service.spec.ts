import { Test, TestingModule } from '@nestjs/testing';
import { UserConventionPermissionsService } from './user-convention-permissions.service';

describe('UserConventionPermissionsService', () => {
  let service: UserConventionPermissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserConventionPermissionsService],
    }).compile();

    service = module.get<UserConventionPermissionsService>(UserConventionPermissionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
