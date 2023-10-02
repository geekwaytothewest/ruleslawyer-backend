import { Injectable } from '@nestjs/common';
import { Prisma, UserConventionPermissions } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserConventionPermissionsService {
  constructor(private prisma: PrismaService) {}

  async createPermissions(
    data: Prisma.UserConventionPermissionsCreateInput,
  ): Promise<UserConventionPermissions> {
    return this.prisma.userConventionPermissions.create({
      data,
    });
  }
}
