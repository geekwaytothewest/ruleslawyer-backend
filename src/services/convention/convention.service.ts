import { Injectable } from '@nestjs/common';
import { Convention, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { OrganizationService } from '../organization/organization.service';

@Injectable()
export class ConventionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly organizationService: OrganizationService,
  ) {}

  async createConvention(
    data: Prisma.ConventionCreateInput,
  ): Promise<Convention> {
    const org = await this.organizationService.organizationWithUsers({
      id: data.organization.connect.id,
    });

    const userPermissions = org.users.map((u) => {
      return {
        userId: u.userId,
        admin: true,
        geekGuide: false,
        attendee: false,
      };
    });

    data.users = {
      create: [
        {
          userId: org.owner.id,
          admin: true,
          geekGuide: false,
          attendee: false,
        },
        ...userPermissions,
      ],
    };

    const con = await this.prisma.convention.create({
      data,
    });

    return con;
  }

  async convention(
    conventionWhereUniqueInput: Prisma.ConventionWhereUniqueInput,
  ): Promise<Convention | null> {
    return this.prisma.convention.findUnique({
      where: conventionWhereUniqueInput,
    });
  }

  async conventionWithUsers(
    conventionWhereUniqueInput: Prisma.ConventionWhereUniqueInput,
  ): Promise<any> {
    return this.prisma.convention.findUnique({
      where: conventionWhereUniqueInput,
      include: {
        users: true,
      },
    });
  }
}
