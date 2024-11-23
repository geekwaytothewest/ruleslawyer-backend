import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const user = ctx.getArgByIndex(0).user?.user;
    return user;
  },
);
