import {
  Controller,
  Get,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/auth/auth.guard';
import { UserSelfGuard } from '../../guards/user/user-self.guard';
import { User } from '../../modules/authz/user.decorator';
import { UserService } from '../../services/user/user.service';
import { UserOrganizationPermissionsService } from '../../services/user-organization-permissions/user-organization-permissions.service';
import { UserConventionPermissionsService } from '../../services/user-convention-permissions/user-convention-permissions.service';
import { Context } from '../../services/prisma/context';
import { PrismaService } from '../../services/prisma/prisma.service';

@Controller()
export class PermissionsController {
  ctx: Context;

  constructor(
    private readonly userService: UserService,
    private readonly userOrganizationPermissionsService: UserOrganizationPermissionsService,
    private readonly userConventionPermissionsService: UserConventionPermissionsService,
    private readonly prismaService: PrismaService,
  ) {
    this.ctx = {
      prisma: prismaService,
    };
  }

  @UseGuards(JwtAuthGuard, UserSelfGuard)
  @Get(':id')
  async getPermissions(@Param('id') id: string, @User() authUser: any) {
    const user = await this.userService.user(
      isNaN(Number(id)) ? { email: String(id) } : { id: Number(id) },
      this.ctx,
    );

    if (!user) {
      return Promise.reject(new NotFoundException());
    }

    const [organizations, conventions] = await Promise.all([
      this.userOrganizationPermissionsService.userOrganizationPermissionsWithOwned(
        String(user.id),
        authUser,
        this.ctx,
      ),
      this.userConventionPermissionsService.userConventionPermissions(
        String(user.id),
        this.ctx,
      ),
    ]);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        superAdmin: user.superAdmin,
        pronounsId: user.pronounsId,
      },
      organizations,
      conventions,
    };
  }
}
