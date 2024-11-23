import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RouterModule } from '@nestjs/core';
import { UserModule } from './modules/user/user.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { AuthzModule } from './modules/authz/authz.module';
import { ConventionModule } from './modules/convention/convention.module';
import { HttpModule } from 'nestjs-http-promise';
import { UserOrganizationPermissionsModule } from './modules/user-organization-permissions/user-organization-permissions.module';
import { UserConventionPermissionsModule } from './modules/user-convention-permissions/user-convention-permissions.module';
import { UserService } from './services/user/user.service';
import { PrismaService } from './services/prisma/prisma.service';
import { GameModule } from './modules/game/game.module';
import { CopyModule } from './modules/copy/copy.module';
import { CollectionModule } from './modules/collection/collection.module';
import { AttendeeModule } from './modules/attendee/attendee.module';
import { LegacyModule } from './modules/legacy/legacy.module';
import { ClsModule } from 'nestjs-cls';
import { FastifyRequest } from 'fastify';
import { v4 as uuidv4 } from 'uuid';

const routes = [
  {
    path: '/api/user',
    module: UserModule,
  },
  {
    path: '/api/org',
    module: OrganizationModule,
  },
  {
    path: '/api/con',
    module: ConventionModule,
  },
  {
    path: '/api/userOrgPerm',
    module: UserOrganizationPermissionsModule,
  },
  {
    path: '/api/userConPerm',
    module: UserConventionPermissionsModule,
  },
  {
    path: '/api/game',
    module: GameModule,
  },
  {
    path: '/api/copy',
    module: CopyModule,
  },
  {
    path: '/api/legacy',
    module: LegacyModule,
  },
  {
    path: 'api/collection',
    module: CollectionModule,
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
    CollectionModule,
    AttendeeModule,
    LegacyModule,
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: (req: FastifyRequest) =>
          req.headers['X-Request-Id'] ?? uuidv4(),
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService, UserService, PrismaService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {}
}
