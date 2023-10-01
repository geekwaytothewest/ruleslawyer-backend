import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from '../../services/user/user.service';
import { User as UserModel } from '@prisma/client';
import { AuthGuard } from '../../guards/auth.guard';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async signupUser(
    @Body()
    userData: {
      name?: string;
      username?: string;
      email: string;
    },
  ): Promise<boolean> {
    await this.userService.createUser(userData);
    return true;
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<UserModel> {
    const idAsInt = Number(id);
    const user: UserModel = await this.userService.user({
      id: idAsInt,
    });

    if (!user) {
      throw new NotFoundException();
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      passwordHash: "wouldn't you like to know",
      superAdmin: user.superAdmin,
    };
  }

  @UseGuards(AuthGuard)
  @Get('byEmail:email')
  async getUserByEmail(@Param('email') email: string): Promise<UserModel> {
    const usersMatch = await this.userService.users({
      where: {
        email: {
          equals: email,
        },
      },
    });

    return {
      id: usersMatch[0].id,
      email: usersMatch[0].email,
      name: usersMatch[0].name,
      username: usersMatch[0].username,
      passwordHash: "wouldn't you like to know",
      superAdmin: usersMatch[0].superAdmin,
    };
  }
}
