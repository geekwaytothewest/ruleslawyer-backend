// src/authz/jwt.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { UserService } from '../../services/user/user.service';
import { PrismaService } from '../../services/prisma/prisma.service';
import { Context } from '../../services/prisma/context';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'gwJwt') {
  ctx: Context;

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
      // Bootstrap: the very first user to sign in becomes super admin. Check
      // for an empty table rather than `id === 1` — autoincrement ids can skip 1
      // after rolled-back inserts, deletes, or a restore, which would otherwise
      // leave the system with no super admin (or unable to ever re-bootstrap).
      const isFirstUser =
        (await this.userService.getUserCount(this.ctx)) === 0;

      user = await this.userService.createUser(
        {
          email: payload.user_email,
          name: payload.user_name,
        },
        this.ctx,
      );

      if (isFirstUser) {
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
