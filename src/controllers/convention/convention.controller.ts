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
    const convention = await this.conventionService.convention({
      id: Number(id),
    });

    if (!convention.tteConventionId) {
      throw 'Convention missing tteConventionId.';
    }

    const session = await this.tteService.getSession(
      userData.userName,
      userData.password,
      userData.apiKey,
    );

    if (!session) {
      throw 'invalid tte session';
    }

    const tteBadgeTypes = await this.tteService.getBadgeTypes(
      convention.tteConventionId,
      session,
    );

    if (!tteBadgeTypes) {
      throw 'badge type query failed';
    }

    const tteBadges = await this.tteService.getBadges(
      convention.tteConventionId,
      session,
    );

    if (!tteBadges) {
      throw 'badge query failed';
    }

    const attendees = tteBadges.map((b) => {
      return <Prisma.AttendeeCreateInput>{
        convention: {
          connect: {
            id: Number(id),
          },
        },
        name: b.name,
        badgeType: {
          connectOrCreate: {
            create: {
              name: tteBadgeTypes.filter((bt) => bt.id === b.badgetype_id)[0]
                .name,
            },
            where: {
              name: tteBadgeTypes.filter((bt) => bt.id === b.badgetype_id)[0]
                .name,
            },
          },
        },
        registrationCode: this.uuidv4(),
        email: b.email,
        badgeNumber: b.badge_number.toString(),
      };
    });

    for (const a of attendees) {
      await this.attendeeService.createAttendee(a);
    }

    return true;
  }

  uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0,
          v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  }
}
