import { Test, TestingModule } from '@nestjs/testing';
import { UserConventionPermissionsService } from './user-convention-permissions.service';
import { UserConventionPermissionsModule } from '../../modules/user-convention-permissions/user-convention-permissions.module';

describe('UserConventionPermissionsService', () => {
  let service: UserConventionPermissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UserConventionPermissionsModule],
    }).compile();

    service = module.get<UserConventionPermissionsService>(
      UserConventionPermissionsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
