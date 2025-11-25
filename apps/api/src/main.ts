import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, INestApplication } from '@nestjs/common'; 
import { readFileSync } from 'fs';
import { join } from 'path';

async function bootstrap() {
  let app: INestApplication;
  let protocol = 'http'; 
  const port = process.env.PORT ?? 3001;

  if (process.env.NODE_ENV === 'production') {
    console.log('Running in production mode (HTTPS)');
    protocol = 'https';
    const httpsOptions = {
      key: readFileSync(join(__dirname, '..', 'certs', 'key.pem')),
      cert: readFileSync(join(__dirname, '..', 'certs', 'cert.pem')),
    };

    app = await NestFactory.create(AppModule, {
      httpsOptions,
    });

  } else {
    console.log('Running in development mode (HTTP)');
    app = await NestFactory.create(AppModule);
  }

  // Configuração de CORS
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  const corsOptions = {
    origin: isDevelopment 
      ? true // Permite todas as origens em desenvolvimento
      : (process.env.FRONT_END_URL 
          ? process.env.FRONT_END_URL.split(',')
          : ['http://127.0.0.1:3000']),
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    exposedHeaders: ['Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };
  
  app.enableCors(corsOptions);
  
  // Log para debug em desenvolvimento
  if (isDevelopment) {
    console.log('🔓 CORS enabled for all origins (development mode)');
  }

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');

  console.log(`🚀 Server running on ${protocol}://127.0.0.1:${port}`);
}

bootstrap();