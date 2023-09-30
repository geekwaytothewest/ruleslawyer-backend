import { Module } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { PrismaService } from '../services/prisma.service';
import { UserController } from '../controllers/user.controller';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserService, PrismaService],
})
export class UserModule {}
