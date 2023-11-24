import { Test, TestingModule } from '@nestjs/testing';
import { PrizeEntryGuard } from './prize-entry.guard';
import { ConventionModule } from '../../modules/convention/convention.module';
import { OrganizationModule } from '../../modules/organization/organization.module';
import { PrismaService } from '../../services/prisma/prisma.service';

describe('PrizeEntryGuard', () => {
  let guard: PrizeEntryGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [],
      providers: [PrizeEntryGuard, PrismaService],
      imports: [ConventionModule, OrganizationModule],
    }).compile();

    guard = module.get<PrizeEntryGuard>(PrizeEntryGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });
});
