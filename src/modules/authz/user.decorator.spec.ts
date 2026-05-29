import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { User } from './user.decorator';

// createParamDecorator wraps the factory; pull it back out via the metadata it
// records so the factory can be exercised directly.
function getFactory() {
  class Probe {
    handler(@User() _user: any) {}
  }
  const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, Probe, 'handler');
  return args[Object.keys(args)[0]].factory as (
    data: unknown,
    ctx: ExecutionContext,
  ) => any;
}

const ctxWithFirstArg = (arg: any): ExecutionContext =>
  ({ getArgByIndex: (i: number) => (i === 0 ? arg : undefined) }) as any;

describe('User param decorator', () => {
  it('returns the nested user from the first handler argument', () => {
    const factory = getFactory();
    const authedUser = { id: 1, email: 'a@b.com' };

    const result = factory(undefined, ctxWithFirstArg({ user: { user: authedUser } }));

    expect(result).toBe(authedUser);
  });

  it('returns undefined when the request has no user', () => {
    const factory = getFactory();

    const result = factory(undefined, ctxWithFirstArg({}));

    expect(result).toBeUndefined();
  });
});
