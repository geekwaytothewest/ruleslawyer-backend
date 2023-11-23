// src/authz/jwt.strategy.ts

import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import * as dotenv from 'dotenv';
import { UserService } from '../../services/user/user.service';
import { PrismaService } from '../../services/prisma/prisma.service';
import { Context } from '../../services/prisma/context';

dotenv.config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'gwJwt') {
  ctx: Context;
  private readonly logger = new Logger('jwtAuth');

  constructor(
    private readonly userService: UserService,
    private readonly prismaService: PrismaService,
  ) {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${process.env.AUTH0_ISSUER_URL}.well-known/jwks.json`,
      }),

      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: process.env.AUTH0_AUDIENCE,
      issuer: `${process.env.AUTH0_ISSUER_URL}`,
      algorithms: ['RS256'],
    });
    this.logger.log(`${process.env.AUTH0_ISSUER_URL}`);
    this.ctx = {
      prisma: prismaService,
    };
  }

  async validate(payload: any) {
    if (!payload.user_email) {
      throw new UnauthorizedException();
    }

    let user = await this.userService.user(
      {
        email: payload.user_email,
      },
      this.ctx,
    );

    if (!user) {
      user = await this.userService.createUser(
        {
          email: payload.user_email,
          name: payload.user_name,
        },
        this.ctx,
      );

      if (user.id === 1) {
        user = await this.userService.updateUser(
          {
            where: {
              id: user.id,
            },
            data: {
              superAdmin: true,
            },
          },
          this.ctx,
        );
      }
    }

    payload.user = user;

    return payload;
  }
}
