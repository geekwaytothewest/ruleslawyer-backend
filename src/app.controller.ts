import { Controller, Get } from '@nestjs/common';
import { UserService } from './services/user/user.service';

@Controller()
export class AppController {
  constructor(private readonly userService: UserService) {}

  @Get('status')
  async status() {
    const userCount = await this.userService.getUserCount();

    if (userCount === 0) {
      return 'initialized';
    } else if (userCount > 0) {
      return 'live';
    }
  }
}
