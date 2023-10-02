import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Get('status')
  status() {
    return 'live';
  }
}
