import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationController } from './organization.controller';
import { PrismaService } from '../../services/prisma/prisma.service';
import { OrganizationService } from '../../services/organization/organization.service';
import { ConventionService } from '../../services/convention/convention.service';
import { TabletopeventsService } from '../../services/tabletopevents/tabletopevents.service';
import { AttendeeService } from '../../services/attendee/attendee.service';
import { HttpModule } from '@nestjs/axios';

describe('OrganizationController', () => {
  let controller: OrganizationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      controllers: [OrganizationController],
      providers: [
        PrismaService,
        OrganizationService,
        ConventionService,
        TabletopeventsService,
        AttendeeService,
      ],
    }).compile();

    controller = module.get<OrganizationController>(OrganizationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
