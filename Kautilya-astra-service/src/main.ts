import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS so your Vue frontend can connect without Network Errors
  app.enableCors();

  // Enable global DTO validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  
  const port = process.env.PORT || 3333;
  await app.listen(port);
  console.log(`🚀 Backend is officially running on http://localhost:${port}`);
}
bootstrap();
