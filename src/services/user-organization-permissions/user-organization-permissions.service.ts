import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, UserOrganizationPermissions } from '@prisma/client';

@Injectable()
export class UserOrganizationPermissionsService {
  constructor(private prisma: PrismaService) {}

  async createPermissions(
    data: Prisma.UserOrganizationPermissionsCreateInput,
  ): Promise<UserOrganizationPermissions> {
    return this.prisma.userOrganizationPermissions.create({
      data,
    });
  }
}
