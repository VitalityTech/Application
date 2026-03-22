import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('ask')
  async ask(
    @Body('question') question: string,
    @Body('userId') userId: string,
  ) {
    // Ми будемо передавати userId прямо з фронтенду для простоти
    const answer = await this.aiService.askQuestion(userId, question);

    return { answer };
  }
}
