import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { UserConventionPermissions } from '@prisma/client';
import { UserConventionPermissionsEntity } from '../../common/entities/user-convention-permissions.entity';
import {
  UserConventionPermissionsWithUserEntity,
  UserConventionPermissionsWithConventionEntity,
} from '../../common/entities/permission-with-relations.entity';
import { CreateConventionPermissionDto } from './dto/create-convention-permission.dto';
import { UpdateConventionPermissionDto } from './dto/update-convention-permission.dto';
import { JwtAuthGuard } from '../../guards/auth/auth.guard';
import { UserConventionPermissionsService } from '../../services/user-convention-permissions/user-convention-permissions.service';
import { Context } from '../../services/prisma/context';
import { PrismaService } from '../../services/prisma/prisma.service';
import { UserGuard } from '../../guards/user/user.guard';
import { ConventionPermissionsSelfUpdateGuard } from '../../guards/permissions/convention-permissions-self-update.guard';
import { ConventionPermissionsGuard } from '../../guards/permissions/convention-permissions.guard';
import { ConventionCreatePermissionsGuard } from '../../guards/permissions/convention-create-permissions.guard';
import { ConventionReadGuard } from '../../guards/convention/convention-read.guard';
import { OrganizationAdminGuard } from '../../guards/organization/organization-admin.guard';
import { AddUserToConventionDto } from './dto/add-user-to-convention.dto';
import { ConventionService } from '../../services/convention/convention.service';

@ApiTags('user-convention-permissions')
@ApiBearerAuth('jwt')
@Controller()
export class UserConventionPermissionsController {
  ctx: Context;

  constructor(
    private readonly userConventionPermissionsService: UserConventionPermissionsService,
    private readonly conventionService: ConventionService,
    private readonly prismaService: PrismaService,
  ) {
    this.ctx = {
      prisma: prismaService,
    };
  }

  @UseGuards(JwtAuthGuard, UserGuard)
  @ApiOkResponse({ type: UserConventionPermissionsWithConventionEntity, isArray: true })
  @Get(':id')
  async getUserConventionPermissions(
    @Param('id') id: string,
  ): Promise<UserConventionPermissions[]> {
    return this.userConventionPermissionsService.userConventionPermissions(
      id,
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, ConventionReadGuard)
  @ApiOkResponse({ type: UserConventionPermissionsWithUserEntity, isArray: true })
  @Get('convention/:id')
  async getConventionUsers(@Param('id') id: string) {
    const permissions =
      await this.userConventionPermissionsService.getPermissionsBySearch(
        {
          conventionId: Number(id),
        },
        this.ctx,
      );

    if (!permissions) {
      return [];
    }

    return permissions;
  }

  @UseGuards(JwtAuthGuard, UserGuard)
  @ApiOkResponse({ type: Number, description: 'Number of convention permissions for the user.' })
  @Get(':id/count')
  async getUserConventionCount(@Param('id') id: string): Promise<number> {
    return await this.userConventionPermissionsService.userConventionCount(
      id,
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, ConventionCreatePermissionsGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiOkResponse({ type: UserConventionPermissionsEntity })
  @Post()
  async createConventionPermission(
    @Body() permissionData: CreateConventionPermissionDto,
  ): Promise<UserConventionPermissions> {
    return this.userConventionPermissionsService.createPermission(
      {
        user: {
          connect: {
            id: permissionData.userId,
          },
        },
        convention: {
          connect: {
            id: permissionData.conventionId,
          },
        },
        admin: permissionData.admin,
        geekGuide: permissionData.geekGuide,
        attendee: permissionData.attendee,
      },
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, ConventionPermissionsGuard, ConventionPermissionsSelfUpdateGuard)
  @ApiOkResponse({ type: UserConventionPermissionsEntity })
  @Delete(':id')
  async deleteConventionPermission(@Param('id') id: string) {
    return await this.userConventionPermissionsService.deletePermission(
      Number(id),
      this.ctx,
    );
  }

  @UseGuards(JwtAuthGuard, ConventionPermissionsGuard, ConventionPermissionsSelfUpdateGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiOkResponse({ type: UserConventionPermissionsEntity })
  @Put(':id')
  async updateConventionPermission(
    @Param('id') id: string,
    @Body() permissionData: UpdateConventionPermissionDto,
  ) {
    return await this.userConventionPermissionsService.updatePermission(
      Number(id),
      permissionData,
      this.ctx,
    );
  }

    @UseGuards(JwtAuthGuard, OrganizationAdminGuard)
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
    @ApiOkResponse({ type: UserConventionPermissionsEntity })
    @Post('convention/:id/addUser')
    async addUser(
      @Param('id') id: string,
      @Body() body: AddUserToConventionDto,
    ) {
      return await this.conventionService.addUserByEmail(
        Number(id),
        body.email,
        {
          admin: body.admin,
          geekGuide: body.geekGuide,
          attendee: body.attendee,
        },
        this.ctx,
      );
    }
}
