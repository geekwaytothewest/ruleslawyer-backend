import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RouterModule } from '@nestjs/core';
import { UserModule } from './modules/user.module';

const routes = [
  {
    path: 'user',
    module: UserModule,
  },
];

@Module({
  imports: [RouterModule.register(routes), UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
