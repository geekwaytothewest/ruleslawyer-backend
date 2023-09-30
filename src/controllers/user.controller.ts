import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { User as UserModel } from '@prisma/client';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async signupUser(
    @Body() userData: { name?: string; email: string; superAdmin: boolean },
  ): Promise<UserModel> {
    return this.userService.createUser(userData);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<UserModel[]> {
    const idAsInt = Number(id);
    return this.userService.users({
      where: {
        id: {
          equals: idAsInt,
        },
      },
    });
  }

  @Get('byEmail:email')
  async getUserByEmail(@Param('email') email: string): Promise<UserModel[]> {
    return this.userService.users({
      where: {
        email: {
          equals: email,
        },
      },
    });
  }
}
