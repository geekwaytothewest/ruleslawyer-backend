import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Convention, Organization, Prisma } from '@prisma/client';
import { OrganizationService } from 'src/services/organization/organization.service';
import { ConventionService } from 'src/services/convention/convention.service';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { OrganizationGuard } from 'src/guards/organization.guard';

@Controller()
export class OrganizationController {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly conventionService: ConventionService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createOrganization(
    @Body() organizationData: { name: string },
    @Req() request: Request,
  ): Promise<Organization> {
    const ownerId = request['user'].user.id;
    return this.organizationService.createOrganization(
      organizationData.name,
      ownerId,
    );
  }

  @UseGuards(JwtAuthGuard, OrganizationGuard)
  @Post(':id/con')
  async createConvention(
    @Body() conventionData: Prisma.ConventionCreateInput,
    @Req() request: Request,
    @Param('id') id: number,
  ): Promise<Convention> {
    conventionData.organization = {
      connect: {
        id: Number(id),
      },
    };

    return this.conventionService.createConvention(conventionData);
  }
}
