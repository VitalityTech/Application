import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Event } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any): Promise<Event> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { tags, ...eventData } = data;

    let tagsRelation = {};
    if (tags && Array.isArray(tags)) {
      tagsRelation = {
        tags: {
          connectOrCreate: tags.map((tag: string) => ({
            where: { name: tag.toLowerCase() },
            create: { name: tag.toLowerCase() },
          })),
        },
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await (this.prisma as any).event.create({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: {
        ...eventData,
        ...tagsRelation,
      },
      include: { tags: true },
    });
  }

  async findAll(): Promise<Event[]> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await (this.prisma as any).event.findMany({
      include: { tags: true },
    });
  }

  async findOne(id: string): Promise<Event | null> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await (this.prisma as any).event.findUnique({
      where: { id },
      include: { tags: true },
    });
  }

  async update(id: string, data: any): Promise<Event> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { tags, ...eventData } = data;

    let tagsRelation = {};
    if (tags && Array.isArray(tags)) {
      tagsRelation = {
        tags: {
          set: [],
          connectOrCreate: tags.map((tag: string) => ({
            where: { name: tag.toLowerCase() },
            create: { name: tag.toLowerCase() },
          })),
        },
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await (this.prisma as any).event.update({
      where: { id },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: {
        ...eventData,
        ...tagsRelation,
      },
      include: { tags: true },
    });
  }

  async remove(id: string): Promise<Event> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await (this.prisma as any).event.delete({
      where: { id },
    });
  }
}
