import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
  origin: (origin, callback) => {
    const allowed = process.env.FRONT_END_URL?.split(',').map(o => o.trim());

    console.log('ORIGIN RECEBIDO:', origin);
    console.log('ALLOW:', allowed);

    if (!origin || allowed?.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS bloqueado: ' + origin), false);
    }
  },
  credentials: true,
});

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT || 3001, '0.0.0.0');
}

bootstrap();
