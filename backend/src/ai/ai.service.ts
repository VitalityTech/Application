import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import Groq from 'groq-sdk';

@Injectable()
export class AiService {
  private groq: Groq;

  constructor(private readonly prisma: PrismaService) {
    const apiKey = process.env.GROQ_API_KEY;
    this.groq = new Groq({ apiKey });
  }

  async askQuestion(userId: string, question: string): Promise<string> {
    if (!userId) return 'Користувач не ідентифікований.';

    try {
      // Отримуємо події користувача
      const userEvents = await this.prisma.event.findMany({
        where: {
          OR: [{ userId: userId }, { participants: { some: { id: userId } } }],
        },
        include: {
          tags: true,
          participants: { select: { fullName: true } },
        },
      });

      const currentDate = new Date().toLocaleDateString('uk-UA');

      const systemPrompt = `
        Ти — AI Event Assistant. Сьогоднішня дата: ${currentDate}.
        Ось дані подій користувача в JSON: ${JSON.stringify(userEvents)}.
        
        ТВОЇ ЗАВДАННЯ:
        1. Відповідай ВИКЛЮЧНО українською мовою.
        2. Якщо запитують про конкретний місяць (наприклад, "березень"), проаналізуй дати (startDate) і виведи всі події за цей період.
        3. Якщо просять "план на тиждень" або "підбірку", запропонуй 3-5 подій у форматі: день — подія — коротке пояснення чому.
        4. Якщо просять поради для нетворкінгу, дай 2-3 практичні кроки перед подією.
        5. Будь лаконічним і привітним. Використовуй емодзі.
        6. Якщо подій немає, напиши: "На цей період у тебе немає запланованих подій. Можливо, час щось створити? 😉"
      `;

      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question },
        ],

        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
      });

      return (
        chatCompletion.choices[0]?.message?.content ||
        'Вибач, не вдалося сформувати відповідь.'
      );
    } catch (error) {
      console.error('AI Service Error:', error);
      return 'Ой! Сталася помилка при з’єднанні з ШІ. Перевір консоль сервера.';
    }
  }
}
