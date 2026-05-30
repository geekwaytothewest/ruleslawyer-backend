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
    try {
      return await ctx.prisma.organization.findUnique({
        where: organizationWhereUniqueInput,
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async allOrganizations(ctx: Context): Promise<Organization[] | null> {
    try {
      return await ctx.prisma.organization.findMany();
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async organizationWithUsers(
    organizationWhereUniqueInput: Prisma.OrganizationWhereUniqueInput,
    ctx: Context,
  ): Promise<any> {
    try {
      return await ctx.prisma.organization.findUnique({
        where: organizationWhereUniqueInput,
        include: {
          users: true,
          owner: true,
        },
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async organizationByOwner(id: number, ctx: Context): Promise<any> {
    try {
      return await ctx.prisma.organization.findMany({
        where: {
          ownerId: id,
        },
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async organizationWithCollections(
    organizationWhereUniqueInput: Prisma.OrganizationWhereUniqueInput,
    ctx: Context,
  ): Promise<any> {
    try {
      return await ctx.prisma.organization.findUnique({
        where: organizationWhereUniqueInput,
        include: {
          collections: true,
        },
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async createOrganization(
    name: string,
    ownerId: number,
    ctx: Context,
  ): Promise<Organization> {
    try {
      return await ctx.prisma.organization.create({
        data: {
          name: name,
          ownerId: ownerId,
        },
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }

  async addUserByEmail(
    organizationId: Number,
    email: string,
    permissions: {
      admin: boolean;
      geekGuide: boolean;
      readOnly: boolean;
    },
    ctx: Context,
  ) {
    try {
      let user = await ctx.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        user = await ctx.prisma.user.create({
          data: {
            email,
          },
        });
      }

      return await ctx.prisma.userOrganizationPermissions.create({
        data: {
          userId: user.id,
          organizationId: Number(organizationId),
          admin: permissions.admin,
          geekGuide: permissions.geekGuide,
          readOnly: permissions.readOnly,
        },
      });
    } catch (ex) {
      return Promise.reject(ex);
    }
  }
}
