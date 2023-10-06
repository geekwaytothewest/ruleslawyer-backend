import { Controller, Get } from '@nestjs/common';
import { UserService } from './services/user/user.service';

@Controller()
export class AppController {
  constructor(private readonly userService: UserService) {}

  @Get('status')
  async status() {
    try {
      const userCount = await this.userService.getUserCount();

      if (userCount === 0) {
        return 'initialized';
      }

      return 'live';
    } catch (error) {
      return 'no database connection';
    }
  }
}
