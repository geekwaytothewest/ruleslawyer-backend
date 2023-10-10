import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../services/user/user.service';
import { ExecutionContext } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { SuperAdminGuard } from './superAdmin.guard';

describe('SuperAdminGuard', () => {
  let guard: SuperAdminGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [],
      providers: [SuperAdminGuard, UserService],
    }).compile();

    guard = module.get<SuperAdminGuard>(SuperAdminGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true with auth', () => {
    const context = createMock<ExecutionContext>({
      getArgByIndex: () => ({
        user: {
          user: { id: 1, superAdmin: true },
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
      }),
    });

    const authed = guard.canActivate(context);

    expect(authed).toBeFalsy();
  });
});
