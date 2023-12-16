import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  NestFastifyApplication,
  FastifyAdapter,
} from '@nestjs/platform-fastify';
import multipart from '@fastify/multipart';
import { RuleslawyerLogger } from './utils/ruleslawyer.logger';

async function bootstrap() {
	const logger = new RuleslawyerLogger('NESTJS');
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule, 
		new FastifyAdapter({ logger: true }),
		{
			logger: logger
		}
  );
  await app.register(multipart);
  app.enableCors({
    origin: [
      `${process.env.ADMIN_CLIENT_ORIGIN}`,
      `${process.env.LIBRARIAN_CLIENT_ORIGIN}`,
      `${process.env.PLAY_AND_WIN_CLIENT_ORIGIN}`,
    ],
  });
  await app.listen(`${process.env.FASTIFY_PORT}`, '0.0.0.0');
  logger.log(`listening on: ${process.env.FASTIFY_PORT}`);
}
bootstrap();
