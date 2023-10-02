import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { Convention, Prisma } from '@prisma/client';
import { ConventionService } from 'src/services/convention/convention.service';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { SuperAdminGuard } from 'src/guards/superAdmin.guard';
import { TabletopeventsService } from 'src/services/tabletopevents/tabletopevents.service';
import { ConventionGuard } from 'src/guards/convention.guard';
import { OrganizationService } from 'src/services/organization/organization.service';
import { AttendeeService } from 'src/services/attendee/attendee.service';

@Controller()
export class ConventionController {
  constructor(
    private readonly conventionService: ConventionService,
    private readonly tteService: TabletopeventsService,
    private readonly organizationService: OrganizationService,
    private readonly attendeeService: AttendeeService,
  ) {}

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Post()
  async createConvention(
    @Body()
    conventionData: Prisma.ConventionCreateInput,
  ): Promise<Convention> {
    return this.conventionService.createConvention(conventionData);
  }

  @UseGuards(JwtAuthGuard, ConventionGuard)
  @Post(':id/importAttendees')
  async importAttendees(
    @Param('id') id: number,
    @Body()
    userData: {
      userName: string;
      password: string;
      apiKey: string;
    },
  ) {
    return this.conventionService.importAttendees(userData, id);
  }
}
