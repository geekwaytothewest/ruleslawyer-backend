import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  NestFastifyApplication,
  FastifyAdapter,
} from '@nestjs/platform-fastify';
import multipart from '@fastify/multipart';
import { RuleslawyerLogger } from './utils/ruleslawyer.logger';
import * as fastify from 'fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';


async function bootstrap() {
  const fastifyInstance = fastify({ logger: true });
  fastifyInstance.addHook('onRoute', (opts) => {
    if (opts.path === '/api/status') {
      opts.logLevel = 'silent';
    }
  });
  // Long-running jobs (attendee imports, BGG sync) now run in the background
  // and return 202 immediately, so the server no longer needs an extended
  // request timeout to keep those connections alive.
  const logger = new RuleslawyerLogger('NESTJS');
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(fastifyInstance),
    {
      logger: ['debug', 'error', 'fatal', 'log', 'verbose', 'warn'],
    },
  );
  await app.register(multipart);
  app.enableCors({
    origin: [
      `${process.env.ADMIN_CLIENT_ORIGIN}`,
      `${process.env.LIBRARIAN_CLIENT_ORIGIN}`,
      `${process.env.PLAY_AND_WIN_CLIENT_ORIGIN}`,
      `${process.env.RULESLAWYER_FRONTEND_ORIGIN}`,
      `${process.env.RULESLAWYER_FRONTEND_ORIGIN}`,
      `${process.env.RULESLAWYER_FRONTEND_ORIGIN2}`,
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  // Trailing slash is part of AUTH0_ISSUER_URL (the jwt strategy appends paths
  // directly to it), so the OAuth2 endpoints are built the same way.
  const auth0Issuer = process.env.AUTH0_ISSUER_URL;
  const swaggerConfig = new DocumentBuilder()
    .setTitle('RulesLawyer API')
    .setDescription('Board game library and convention management API')
    .setVersion('1.0')
    .addOAuth2(
      {
        type: 'oauth2',
        flows: {
          authorizationCode: {
            authorizationUrl: `${auth0Issuer}authorize`,
            tokenUrl: `${auth0Issuer}oauth/token`,
            scopes: {
              openid: 'OpenID Connect',
              profile: 'User profile',
              email: 'User email',
            },
          },
        },
      },
      // Scheme name matches the existing @ApiBearerAuth('jwt') decorators, so no
      // controller changes are needed — operations now resolve to this flow.
      'jwt',
    )
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      initOAuth: {
        clientId: process.env.SWAGGER_AUTH0_CLIENT_ID,
        scopes: ['openid', 'profile', 'email'],
        usePkceWithAuthorizationCodeGrant: true,
        // Auth0 only mints a JWT access token for the API when `audience` is
        // sent on the /authorize call; without it the token is opaque and the
        // API's RS256 validation rejects it.
        additionalQueryStringParams: {
          audience: process.env.AUTH0_AUDIENCE ?? '',
        },
      },
    },
  });

  await app.listen(`${process.env.FASTIFY_PORT}`, '0.0.0.0');
  logger.log(`listening on: ${process.env.FASTIFY_PORT}`);
  logger.log(`swagger docs: /api/docs`);
}
bootstrap();
