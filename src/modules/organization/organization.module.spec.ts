import { Test } from '@nestjs/testing';
import { OrganizationModule } from './organization.module';

describe('OrganizationModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [OrganizationModule],
    }).compile();

    expect(module).toBeDefined();
  });
});
