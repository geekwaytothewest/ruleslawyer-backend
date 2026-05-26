import { ExecutionContext } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { JwtAuthGuard } from './auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow OPTIONS requests without authentication', () => {
    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({ method: 'OPTIONS' }),
      }),
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should defer to passport for non-OPTIONS requests', async () => {
    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({ method: 'GET', headers: {} }),
        getResponse: () => ({}),
      }),
    });

    // For non-OPTIONS requests the guard delegates to passport's AuthGuard
    // rather than short-circuiting to `true`. With no credentials passport
    // rejects, so the result is a rejected promise (not a synchronous `true`).
    const result = guard.canActivate(context);
    expect(result).not.toBe(true);
    await expect(Promise.resolve(result as any)).rejects.toBeDefined();
  });
});
