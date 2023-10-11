import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RouterModule } from '@nestjs/core';
import { UserModule } from './modules/user/user.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { AuthzModule } from './modules/authz/authz.module';
import { ConventionModule } from './modules/convention/convention.module';
import { HttpModule } from '@nestjs/axios';
import { UserOrganizationPermissionsModule } from './modules/user-organization-permissions/user-organization-permissions.module';
import { UserConventionPermissionsModule } from './modules/user-convention-permissions/user-convention-permissions.module';
import { UserController } from './controllers/user/user.controller';
import { UserService } from './services/user/user.service';
import { PrismaService } from './services/prisma/prisma.service';
import { GameModule } from './modules/game/game.module';
import { CopyModule } from './modules/copy/copy.module';

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
  {
    path: 'userOrgPerm',
    module: UserOrganizationPermissionsModule,
  },
  {
    path: 'userConPerm',
    module: UserConventionPermissionsModule,
  },
  {
    path: 'game',
    module: GameModule,
  },
  {
    path: 'copy',
    module: CopyModule,
  },
];

@Module({
  imports: [
    RouterModule.register(routes),
    AuthzModule,
    HttpModule,
    UserOrganizationPermissionsModule,
    ConventionModule,
    UserModule,
    OrganizationModule,
    UserConventionPermissionsModule,
    GameModule,
    CopyModule,
  ],
  controllers: [AppController, UserController],
  providers: [AppService, UserService, PrismaService],
})
export class AppModule {}
