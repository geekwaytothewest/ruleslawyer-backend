//jwt-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class UserGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext) {
    const user = context.getArgByIndex(0).user.user;
    const userId = context.getArgByIndex(0).params.id;

    if (user?.email === userId) {
      return true;
    }

    if (user?.id === Number(userId)) {
      return true;
    }

    if (user?.superAdmin) {
      return true;
    }

    return false;
  }
}
