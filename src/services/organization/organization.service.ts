import { Injectable } from '@nestjs/common';
import { Organization, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  async organization(
    organizationWhereUniqueInput: Prisma.OrganizationWhereUniqueInput,
  ): Promise<Organization | null> {
    return this.prisma.organization.findUnique({
      where: organizationWhereUniqueInput,
    });
  }

  async organizationWithUsers(
    organizationWhereUniqueInput: Prisma.OrganizationWhereUniqueInput,
  ): Promise<any> {
    return this.prisma.organization.findUnique({
      where: organizationWhereUniqueInput,
      include: {
        users: true,
      },
    });
  }

  async createOrganization(
    name: string,
    ownerId: number,
  ): Promise<Organization> {
    return this.prisma.organization.create({
      data: {
        name: name,
        ownerId: ownerId,
      },
    });
  }
}
