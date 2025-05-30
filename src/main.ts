import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  NestFastifyApplication,
  FastifyAdapter,
} from '@nestjs/platform-fastify';
import multipart from '@fastify/multipart';
import { RuleslawyerLogger } from './utils/ruleslawyer.logger';
import * as fastify from 'fastify';
const plugin = require('fastify-server-timeout')


async function bootstrap() {
  const fastifyInstance = fastify({ logger: true });
  fastifyInstance.addHook('onRoute', (opts) => {
    if (opts.path === '/api/status') {
      opts.logLevel = 'silent';
    }
  });
  fastifyInstance.register(plugin, {
    serverTimeout: 1000 * 60 * 20, // 20 minutes
  });
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
  });
  await app.listen(`${process.env.FASTIFY_PORT}`, '0.0.0.0');
  logger.log(`listening on: ${process.env.FASTIFY_PORT}`);
}
bootstrap();
