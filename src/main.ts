import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  NestFastifyApplication,
  FastifyAdapter,
} from '@nestjs/platform-fastify';
import multipart from '@fastify/multipart';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  await app.register(multipart);
  app.enableCors({
    origin: [
      `${process.env.ADMIN_CLIENT_ORIGIN}`,
      `${process.env.LIBRARIAN_CLIENT_ORIGIN}`,
      `${process.env.PLAY_AND_WIN_CLIENT_ORIGIN}`,
    ],
  });
  await app.listen(`${process.env.FASTIFY_PORT}`);
}
bootstrap();
