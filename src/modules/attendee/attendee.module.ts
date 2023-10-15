import { Module } from '@nestjs/common';
import { PrismaService } from '../../services/prisma/prisma.service';
import { AttendeeService } from '../../services/attendee/attendee.service';

@Module({
  imports: [],
  controllers: [],
  providers: [AttendeeService, PrismaService],
  exports: [AttendeeService],
})
export class AttendeeModule {}
