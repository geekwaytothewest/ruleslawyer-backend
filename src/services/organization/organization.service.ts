import { Injectable } from '@nestjs/common';
import { Organization, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Context } from '../prisma/context';

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  async organization(
    organizationWhereUniqueInput: Prisma.OrganizationWhereUniqueInput,
    ctx: Context,
  ): Promise<Organization | null> {
    return ctx.prisma.organization.findUnique({
      where: organizationWhereUniqueInput,
    });
  }

  async organizationWithUsers(
    organizationWhereUniqueInput: Prisma.OrganizationWhereUniqueInput,
    ctx: Context,
  ): Promise<any> {
    return ctx.prisma.organization.findUnique({
      where: organizationWhereUniqueInput,
      include: {
        users: true,
        owner: true,
      },
    });
  }

  async organizationWithCollections(
    organizationWhereUniqueInput: Prisma.OrganizationWhereUniqueInput,
    ctx: Context,
  ): Promise<any> {
    return ctx.prisma.organization.findUnique({
      where: organizationWhereUniqueInput,
      include: {
        collections: true,
      },
    });
  }

  async createOrganization(
    name: string,
    ownerId: number,
    ctx: Context,
  ): Promise<Organization> {
    return ctx.prisma.organization.create({
      data: {
        name: name,
        ownerId: ownerId,
      },
    });
  }
}
