import {
  Controller,
  Get,
  Param,
  UseGuards,
  NotFoundException,
	Logger,
} from '@nestjs/common';
import { UserService } from '../../services/user/user.service';
import { User as UserModel } from '@prisma/client';
import { JwtAuthGuard } from '../../guards/auth/auth.guard';
import { UserGuard } from '../../guards/user/user.guard';
import { Context } from '../../services/prisma/context';
import { PrismaService } from '../../services/prisma/prisma.service';

@Controller()
export class UserController {
	ctx: Context;
	private readonly logger = new Logger(UserController.name);

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

		console.log(`getting user with id=${id}`)
		this.logger.log(`Getting user with id=${id}`)

		if (!isNaN(Number(id))) {
			this.logger.debug(`${id} is a number`);
      user = await this.userService.user(
        {
          id: Number(id),
        },
        this.ctx,
			);
		} else {
			// TODO: mask; email is PII
			this.logger.debug(`${id} is an email`);
      user = await this.userService.user(
				{
					email: id,
        },
        this.ctx,
				);
			}
			
			if (!user) {
				this.logger.error((`User with id=${id} not found`))
				return Promise.reject(new NotFoundException());
			}
		this.logger.log(`Got user with id=${user.id}}`)

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
