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
  const swaggerConfig = new DocumentBuilder()
    .setTitle('RulesLawyer API')
    .setDescription('Board game library and convention management API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'jwt',
    )
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(`${process.env.FASTIFY_PORT}`, '0.0.0.0');
  logger.log(`listening on: ${process.env.FASTIFY_PORT}`);
  logger.log(`swagger docs: /api/docs`);
}
bootstrap();
