import { Controller, Get } from '@nestjs/common';
import { UserService } from './services/user/user.service';
import { Context } from './services/prisma/context';
import { PrismaService } from './services/prisma/prisma.service';

@Controller()
export class AppController {
  ctx: Context;

  constructor(
    private readonly userService: UserService,
    private readonly prismaService: PrismaService,
  ) {
    this.ctx = {
      prisma: prismaService,
    };
  }

  @Get('status')
  async status() {
    try {
      const userCount = await this.userService.getUserCount(this.ctx);

      if (userCount === 0) {
        return 'initialized';
      }

      return 'live';
    } catch (error) {
      return 'no database connection';
    }
  }
}
