import { Test, TestingModule } from '@nestjs/testing';
import { ConventionController } from './convention.controller';
import { ConventionService } from '../../services/convention/convention.service';
import { OrganizationService } from '../../services/organization/organization.service';
import { AttendeeService } from '../../services/attendee/attendee.service';
import { TabletopeventsService } from '../../services/tabletopevents/tabletopevents.service';
import { PrismaService } from '../../services/prisma/prisma.service';
import { HttpModule } from '@nestjs/axios';

describe('ConventionController', () => {
  let controller: ConventionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      controllers: [ConventionController],
      providers: [
        ConventionService,
        OrganizationService,
        AttendeeService,
        TabletopeventsService,
        PrismaService,
      ],
    }).compile();

    controller = module.get<ConventionController>(ConventionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
