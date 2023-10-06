import { Test, TestingModule } from '@nestjs/testing';
import { ConventionController } from './convention.controller';
import { ConventionService } from '../../services/convention/convention.service';
import { OrganizationService } from '../../services/organization/organization.service';
import { AttendeeService } from '../../services/attendee/attendee.service';
import { TabletopeventsService } from '../../services/tabletopevents/tabletopevents.service';
import { PrismaService } from '../../services/prisma/prisma.service';
import { HttpModule } from '@nestjs/axios';
import { Convention } from '@prisma/client';

describe('ConventionController', () => {
  let controller: ConventionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      controllers: [ConventionController],
      providers: [
        {
          provide: ConventionService,
          useValue: {
            importAttendees: jest.fn().mockImplementation(() => 1),
            createConvention: jest.fn().mockImplementation(
              () =>
                <Convention>{
                  name: 'Geekway to the Testing',
                },
            ),
            convention: jest.fn().mockImplementation(
              () =>
                <Convention>{
                  name: 'Geekway to the Testing',
                  id: 1,
                },
            ),
            updateConvention: jest
              .fn()
              .mockImplementation(
                () => <Convention>{ name: 'Geekway to the Testing Again' },
              ),
          },
        },
        OrganizationService,
        AttendeeService,
        {
          provide: TabletopeventsService,
          useValue: {
            importAttendees: jest.fn().mockImplementation(() => 1),
            getSession: jest.fn().mockImplementation(() => 'fake session'),
            getBadgeTypes: jest.fn().mockImplementation(() => [
              {
                name: 'fake badge type',
              },
            ]),
            getBadges: jest.fn().mockImplementation(() => [
              {
                name: 'fake name',
                badge_number: 1,
                email: 'fake@email.com',
                custom_fields: {
                  PreferredPronouns: 'she/her',
                },
              },
            ]),
          },
        },
        PrismaService,
      ],
    }).compile();

    controller = module.get<ConventionController>(ConventionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createConvention', () => {
    it('should return a convention object', async () => {
      const createConvention = await controller.createConvention({
        name: 'Geekway to the Testing',
        organization: {
          connect: {
            id: 1,
          },
        },
      });

      expect(createConvention.name).toBe('Geekway to the Testing');
    });
  });

  describe('getConvention', () => {
    it('should return a convention object', async () => {
      const getConvention = await controller.getConvention(1);

      expect(getConvention.id).toBe(1);
    });
  });

  describe('updateConvention', () => {
    it('should update', async () => {
      const updatedConvention = await controller.updateConvention(1, {
        name: 'Geekway to the Testing Again',
      });

      expect(updatedConvention.name).toBe('Geekway to the Testing Again');
    });
  });

  describe('importAttendees', () => {
    it('should import attendees', async () => {
      const attendeeCount = await controller.importAttendees(1, {
        apiKey: 'fake api key',
        userName: 'fake username',
        password: 'fake password',
      });

      expect(attendeeCount).toBe(1);
    });
  });
});
