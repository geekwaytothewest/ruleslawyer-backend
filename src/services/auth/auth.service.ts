import {
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, pass: string): Promise<any> {
    const usersMatch: User[] = await this.userService.users({
      where: {
        email: {
          equals: email,
        },
      },
    });

    if (usersMatch.length === 0) {
      throw new UnauthorizedException();
    } else if (!(await bcrypt.compare(pass, usersMatch[0].passwordHash))) {
      throw new UnauthorizedException();
    }

    const payload = {
      id: usersMatch[0].id,
      email: usersMatch[0].email,
      username: usersMatch[0].username,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
