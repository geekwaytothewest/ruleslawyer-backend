import { Injectable } from '@nestjs/common';
import { Convention } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConventionService {
  constructor(private readonly prisma: PrismaService) {}

  async createConvention(data: Convention): Promise<Convention> {
    return this.prisma.convention.create({
      data,
    });
  }
}
