import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendeeService {
  constructor(private readonly prisma: PrismaService) {}

  async createAttendee(data: Prisma.AttendeeCreateInput): Promise<boolean> {
    await this.prisma.attendee.create({ data });

    return true;
  }

  async truncate(conventionId: number) {
    await this.prisma.attendee.deleteMany({
      where: {
        conventionId: Number(conventionId),
      },
    });
  }
}
