import { Body, Controller, Get, Param, Post, Put, Delete, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserOrganizationPermissions } from '@prisma/client';
import { CreateOrganizationPermissionDto } from './dto/create-organization-permission.dto';
import { UpdateOrganizationPermissionDto } from './dto/update-organization-permission.dto';
import { JwtAuthGuard } from '../../guards/auth/auth.guard';
import { OrganizationWriteGuard } from '../../guards/organization/organization-write.guard';
import { UserOrganizationPermissionsService } from '../../services/user-organization-permissions/user-organization-permissions.service';
import { Context } from '../../services/prisma/context';
import { PrismaService } from '../../services/prisma/prisma.service';
import { UserGuard } from '../../guards/user/user.guard';
import { User } from '../../modules/authz/user.decorator';
import { OrganizationPermissionsSelfUpdateGuard } from '../../guards/permissions/organization-permissions-self-update.guard';
import { OrganizationPermissionsGuard } from '../../guards/permissions/organization-permissions.guard';
import { OrganizationReadGuard } from '../../guards/organization/organization-read.guard';

@ApiTags('user-organization-permissions')
@ApiBearerAuth('jwt')
@Controller()
export class UserOrganizationPermissionsController {
  ctx: Context;

  constructor(
    private readonly userOrganizationPermissionsService: UserOrganizationPermissionsService,
    private readonly prismaService: PrismaService,
  ) {
    this.ctx = {
      prisma: prismaService,
    };
  }

  @UseGuards(JwtAuthGuard, UserGuard)
  @Get(':id')
  async getUserOrganizationPermissions(
    @Param('id') id: string,
    @User() user: any,
  ): Promise<UserOrganizationPermissions[]> {
    return this.userOrganizationPermissionsService.userOrganizationPermissionsWithOwned(
      id,
      user,
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, OrganizationReadGuard)
  @Get('organization/:id')
  async getOrganizationUsers(@Param('id') id: string) {
    const orgId = Number(id);

    const permissions =
      await this.userOrganizationPermissionsService.getPermissionsBySearch(
        {
          organizationId: orgId,
        },
        this.ctx,
      );

    if (!permissions) {
      return [];
    }

    return permissions;
  }

  @UseGuards(JwtAuthGuard, OrganizationWriteGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @Post()
  async createPermission(
    @Body() permissionData: CreateOrganizationPermissionDto,
  ): Promise<UserOrganizationPermissions> {
    return this.userOrganizationPermissionsService.createPermission(
      {
        user: {
          connect: {
            id: permissionData.userId,
          },
        },
        organization: {
          connect: {
            id: permissionData.organizationId,
          },
        },
        admin: permissionData.admin,
        geekGuide: permissionData.geekGuide,
        readOnly: permissionData.readOnly,
      },
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, UserGuard)
  @Get(':id/count')
  async getUserConventionCount(@Param('id') id: string): Promise<number> {
    return await this.userOrganizationPermissionsService.userOrganizationCount(
      id,
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, OrganizationPermissionsGuard, OrganizationPermissionsSelfUpdateGuard)
  @Delete(':id')
  async deleteOrganizationPermission(@Param('id') id: string) {
    return await this.userOrganizationPermissionsService.deletePermission(
      Number(id),
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, OrganizationPermissionsGuard, OrganizationPermissionsSelfUpdateGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @Put(':id')
  async updateOrganizationPermission(
    @Param('id') id: string,
    @Body() permissionData: UpdateOrganizationPermissionDto,
  ) {
    return await this.userOrganizationPermissionsService.updatePermission(
      Number(id),
      {
        admin: permissionData.admin,
        geekGuide: permissionData.geekGuide,
        readOnly: permissionData.readOnly,
      },
      this.ctx,
    );
  }
}
