import { Body, Controller, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Organization, User } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { OrganizationService } from 'src/services/organization/organization.service';
import { UserService } from 'src/services/user/user.service';

@Controller()
export class OrganizationController {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly userService: UserService
  ) {}

  @UseGuards(AuthGuard('gwJwt'))
  @Post()
  async createOrganization(
    @Body() organizationData: { name: string },
    @Req() request: Request,
  ): Promise<Organization> {
    const user: User = await this.userService.user({
      email: request['user'].user_email,
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const ownerId = user.id;
    return this.organizationService.createOrganization(
      organizationData.name,
      ownerId,
    );
  }
}
