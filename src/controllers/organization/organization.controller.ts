import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Organization } from '@prisma/client';
import { AuthGuard } from 'src/guards/auth.guard';
import { OrganizationService } from 'src/services/organization/organization.service';

@Controller()
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @UseGuards(AuthGuard)
  @Post()
  async createOrganization(
    @Body() organizationData: { name: string },
    @Req() request: Request,
  ): Promise<Organization> {
    const ownerId = request['user'].id;
    return this.organizationService.createOrganization(
      organizationData.name,
      ownerId,
    );
  }
}
