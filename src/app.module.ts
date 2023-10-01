import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RouterModule } from '@nestjs/core';
import { UserModule } from './modules/user/user.module';
import { OrganizationModule } from './modules/organizations/organizations.module';
import { AuthzModule } from './modules/authz/authz.module';
import { ConventionModule } from './modules/convention/convention.module';

const routes = [
  {
    path: 'user',
    module: UserModule,
  },
  {
    path: 'org',
    module: OrganizationModule,
  },
  {
    path: 'con',
    module: ConventionModule,
  },
];

@Module({
  imports: [
    RouterModule.register(routes),
    UserModule,
    OrganizationModule,
    AuthzModule,
    ConventionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
