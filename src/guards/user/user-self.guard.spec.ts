import { Test, TestingModule } from '@nestjs/testing';
import { UserSelfGuard } from './user-self.guard';
import { ExecutionContext } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';

describe('UserSelfGuard', () => {
  let guard: UserSelfGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [],
      providers: [UserSelfGuard],
    }).compile();

    guard = module.get<UserSelfGuard>(UserSelfGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true when the id matches the user id', () => {
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

    expect(guard.canActivate(context)).toBeTruthy();
  });

  it('should return true when the id matches the user email', () => {
    const context = createMock<ExecutionContext>({
      getArgByIndex: () => ({
        user: {
          user: { id: 1, email: 'a@b.com', superAdmin: false },
        },
        params: {
          id: 'a@b.com',
        },
      }),
    });

    expect(guard.canActivate(context)).toBeTruthy();
  });

  it('should return false for a superadmin requesting another user', () => {
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

    expect(guard.canActivate(context)).toBeFalsy();
  });

  it('should return false when the id does not match', () => {
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

    expect(guard.canActivate(context)).toBeFalsy();
  });
});
