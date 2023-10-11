import {
  Controller,
  Get,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from '../../services/user/user.service';
import { User as UserModel } from '@prisma/client';
import { JwtAuthGuard } from '../../guards/auth.guard';
import { UserGuard } from '../../guards/user/user.guard';
import { Context } from '../../services/prisma/context';
import { PrismaService } from '../../services/prisma/prisma.service';

@Controller()
export class UserController {
  ctx: Context;

  constructor(
    private readonly userService: UserService,
    private readonly prismaService: PrismaService,
  ) {
    this.ctx = {
      prisma: prismaService,
    };
  }

  @UseGuards(JwtAuthGuard, UserGuard)
  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<UserModel> {
    let user: UserModel | null;

    if (!isNaN(Number(id))) {
      user = await this.userService.user(
        {
          id: Number(id),
        },
        this.ctx,
      );
    } else {
      user = await this.userService.user(
        {
          email: id,
        },
        this.ctx,
      );
    }

    if (!user) {
      return Promise.reject(new NotFoundException());
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      superAdmin: user.superAdmin,
      pronounsId: user.pronounsId,
    };
  }
}
