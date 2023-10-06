import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationController } from './organization.controller';
import { PrismaService } from '../../services/prisma/prisma.service';
import { OrganizationService } from '../../services/organization/organization.service';
import { ConventionService } from '../../services/convention/convention.service';
import { TabletopeventsService } from '../../services/tabletopevents/tabletopevents.service';
import { AttendeeService } from '../../services/attendee/attendee.service';
import { HttpModule } from '@nestjs/axios';
import { Organization } from '@prisma/client';

describe('OrganizationController', () => {
  let controller: OrganizationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      controllers: [OrganizationController],
      providers: [
        PrismaService,
        {
          provide: OrganizationService,
          useValue: {
            createConvention: jest.fn().mockImplementation(() => {
              name: 'Geekway to the Testing';
            }),
            createOrganization: jest.fn().mockImplementation(
              () =>
                <Organization>{
                  name: 'Geekway to the Testing',
                },
            ),
            organizationWithUsers: jest.fn().mockImplementation(
              () =>
                <unknown>{
                  name: 'Geekway to the Testing',
                  users: [],
                },
            ),
          },
        },
        {
          provide: ConventionService,
          useValue: {
            createConvention: jest.fn().mockImplementation(
              () =>
                <unknown>{
                  name: 'Geekway to the Testing',
                },
            ),
          },
        },
        TabletopeventsService,
        AttendeeService,
      ],
    }).compile();

    controller = module.get<OrganizationController>(OrganizationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createOrganization', () => {
    it('should return a organization object', async () => {
      const mockRequest = (<unknown>{
        user: {
          user: {
            id: 1,
          },
        },
      }) as Request;

      const org = await controller.createOrganization(
        {
          name: 'Geekway to the Testing',
        },
        mockRequest,
      );

      expect(org.name).toBe('Geekway to the Testing');
    });
  });

  describe('createConvention', () => {
    it('should return a convention object', async () => {
      const con = await controller.createConvention(
        {
          name: 'Geekway to the Testing',
          organization: {},
        },
        1,
      );

      expect(con.name).toBe('Geekway to the Testing');
    });
  });
});
