import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { PrismaService } from '../prisma.service'; // Додаємо наш сервіс Prisma

@Module({
  imports: [], // Порожньо, бо TypeOrmModule нам більше не потрібен
  controllers: [EventsController],
  providers: [EventsService, PrismaService], // Обов'язково додаємо PrismaService сюди
})
export class EventsModule {}
