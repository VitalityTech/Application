import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { PrismaService } from './prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    EventsModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET ?? 'super-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
