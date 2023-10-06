import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { UserService } from '../../services/user/user.service';
import { PrismaService } from '../../services/prisma/prisma.service';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'gwJwt' })],
  providers: [JwtStrategy, UserService, PrismaService],
  exports: [PassportModule],
})
export class AuthzModule {}
