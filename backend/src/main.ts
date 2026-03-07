import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Дозволяє запити з інших портів (наприклад, з твого React на 5173)
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: http://localhost:3000`);
}
void bootstrap();
