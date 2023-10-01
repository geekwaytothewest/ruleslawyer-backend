import { Module } from '@nestjs/common';
import { ConventionController } from 'src/controllers/convention/convention.controller';
import { ConventionService } from 'src/services/convention/convention.service';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { UserService } from 'src/services/user/user.service';

@Module({
  controllers: [ConventionController],
  providers: [ConventionService, UserService, PrismaService],
  exports: [ConventionService],
})
export class ConventionModule {}
