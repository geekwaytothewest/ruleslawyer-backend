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
import { JwtAuthGuard } from 'src/guards/auth.guard';

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

  @UseGuards(JwtAuthGuard)
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
      superAdmin: user.superAdmin,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('byEmail:email')
  async getUserByEmail(@Param('email') email: string): Promise<UserModel> {
    const user: UserModel = await this.userService.user({
      email: email,
    });

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }
}
