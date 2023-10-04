//jwt-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserService } from 'src/services/user/user.service';

@Injectable()
export class UserGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext) {
    const user = context.getArgByIndex(0).user.user;
    const userId = context.getArgByIndex(0).params.id;

    if (user?.id === Number(userId)) {
      return true;
    }

    if (user?.superAdmin) {
      return true;
    }

    return false;
  }
}
