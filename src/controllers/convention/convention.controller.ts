import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Convention } from '@prisma/client';
import { ConventionService } from 'src/services/convention/convention.service';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { SuperAdminGuard } from 'src/guards/superAdmin.guard';

@Controller()
export class ConventionController {
  constructor(private readonly conventionService: ConventionService) {}

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Post()
  async createConvention(
    @Body()
    conventionData: Convention,
  ): Promise<Convention> {
    return this.conventionService.createConvention(conventionData);
  }
}
