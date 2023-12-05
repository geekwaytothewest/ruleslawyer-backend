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
import { LoggerMiddleware } from './middleware/logger.middleware';
import { ConventionController } from './controllers/convention/convention.controller';
import { CopyController } from './controllers/copy/copy.controller';
import { GameController } from './controllers/game/game.controller';
import { LegacyController } from './controllers/legacy/legacy.controller';
import { OrganizationController } from './controllers/organization/organization.controller';
import { UserController } from './controllers/user/user.controller';
import { UserConventionPermissionsController } from './controllers/user-convention-permissions/user-convention-permissions.controller';
import { UserOrganizationPermissionsController } from './controllers/user-organization-permissions/user-organization-permissions.controller';

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
  ],
  controllers: [AppController],
  providers: [AppService, UserService, PrismaService],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(LoggerMiddleware)
			.forRoutes(
				ConventionController,
				CopyController,
				GameController,
				LegacyController,
				OrganizationController,
				UserController,
				UserConventionPermissionsController,
				UserOrganizationPermissionsController
			)
	}
}
