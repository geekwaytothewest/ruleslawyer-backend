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
    origin: [`${process.env.ORIGIN_URL1}`, `${process.env.ORIGIN_URL2}`],
  });
  await app.listen(`${process.env.FASTIFY_PORT}`);
}
bootstrap();
