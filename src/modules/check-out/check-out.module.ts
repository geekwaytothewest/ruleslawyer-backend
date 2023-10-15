import { Module } from '@nestjs/common';
import { PrismaService } from '../../services/prisma/prisma.service';
import { AttendeeModule } from '../attendee/attendee.module';
import { CheckOutService } from '../../services/check-out/check-out.service';
import { CopyModule } from '../copy/copy.module';

@Module({
  imports: [AttendeeModule, CopyModule],
  controllers: [],
  providers: [CheckOutService, PrismaService],
  exports: [CheckOutService],
})
export class CheckOutModule {}
