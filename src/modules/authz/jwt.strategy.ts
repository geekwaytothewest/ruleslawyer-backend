// src/authz/jwt.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import * as dotenv from 'dotenv';
import { UserService } from 'src/services/user/user.service';

dotenv.config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'gwJwt') {
  constructor(private readonly userService: UserService) {
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
  }

  async validate(payload: any) {
    if (!payload.user_email) {
      throw new UnauthorizedException();
    }

    const user = await this.userService.user({
      email: payload.user_email,
    });

    if (!user) {
      this.userService.createUser({
        email: payload.user_email,
        name: payload.user_name,
      });
    }

    payload.user = user;

    return payload;
  }
}
