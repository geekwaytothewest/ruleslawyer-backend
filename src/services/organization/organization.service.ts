import { Injectable } from '@nestjs/common';
import { Organization } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrganization(
    name: string,
    ownerId: number,
  ): Promise<Organization> {
    await this.prisma.user.findFirstOrThrow({
      where: {
        id: {
          equals: ownerId,
        },
      },
    });

    return this.prisma.organization.create({
      data: {
        name: name,
        ownerId: ownerId,
      },
    });
  }
}
