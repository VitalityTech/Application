import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import Groq from 'groq-sdk';

@Injectable()
export class AiService {
  private groq: Groq;

  constructor(private readonly prisma: PrismaService) {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  async askQuestion(userId: string, question: string): Promise<string> {
    try {
      // Знаходимо події, де користувач є організатором або учасником
      const userEvents = await this.prisma.event.findMany({
        where: {
          OR: [{ userId: userId }, { participants: { some: { id: userId } } }],
        },
        include: {
          tags: true,
          participants: { select: { fullName: true } },
        },
      });

      const systemPrompt = `
      You are an AI Assistant for an event management app. 
      Here is the data of the user's events in JSON: ${JSON.stringify(userEvents)}.
      Current date: ${new Date().toLocaleDateString()}.
      Answer questions concisely using this data. 
      If you can't find the answer, say: "Sorry, I didn’t understand that. Please try rephrasing your question."
      `;

      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question },
        ],
        model: 'llama3-8b-8192',
        temperature: 0.2,
      });

      return (
        chatCompletion.choices[0]?.message?.content ||
        'Sorry, I didn’t understand that. Please try rephrasing your question.'
      );
    } catch (error) {
      console.error('AI Error:', error);
      return 'Sorry, I encountered an error. Please try again later.';
    }
  }
}
