import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Convention, Organization } from '@prisma/client';
import { OrganizationService } from 'src/services/organization/organization.service';
import { UserService } from 'src/services/user/user.service';
import { ConventionService } from 'src/services/convention/convention.service';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { OrganizationGuard } from 'src/guards/organization.guard';

@Controller()
export class OrganizationController {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly conventionService: ConventionService,
    private readonly userService: UserService,
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
    @Body() conventionData: Convention,
    @Req() request: Request,
    @Param('id') id: number,
  ): Promise<Convention> {
    conventionData.organizationId = Number(id);
    return this.conventionService.createConvention(conventionData);
  }
}
