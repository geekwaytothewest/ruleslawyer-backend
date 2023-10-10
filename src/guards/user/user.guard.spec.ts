import { Test, TestingModule } from '@nestjs/testing';
import { UserGuard } from './user.guard';
import { UserService } from '../../services/user/user.service';
import { ExecutionContext } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';

describe('UserGuard', () => {
  let guard: UserGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [],
      providers: [UserGuard, UserService],
    }).compile();

    guard = module.get<UserGuard>(UserGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true with auth', () => {
    const context = createMock<ExecutionContext>({
      getArgByIndex: () => ({
        user: {
          user: { id: 1, superAdmin: false },
        },
        params: {
          id: 1,
        },
      }),
    });

    const authed = guard.canActivate(context);

    expect(authed).toBeTruthy();
  });

  it('should return true with superadmin auth', () => {
    const context = createMock<ExecutionContext>({
      getArgByIndex: () => ({
        user: {
          user: { id: 2, superAdmin: true },
        },
        params: {
          id: 1,
        },
      }),
    });

    const authed = guard.canActivate(context);

    expect(authed).toBeTruthy();
  });

  it('should return false with bad auth', () => {
    const context = createMock<ExecutionContext>({
      getArgByIndex: () => ({
        user: {
          user: { id: 2, superAdmin: false },
        },
        params: {
          id: 1,
        },
      }),
    });

    const authed = guard.canActivate(context);

    expect(authed).toBeFalsy();
  });
});
