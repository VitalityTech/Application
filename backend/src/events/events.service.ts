import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Event, Prisma } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.EventCreateInput): Promise<Event> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await (this.prisma as any).event.create({ data });
  }

  async findAll(): Promise<Event[]> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await (this.prisma as any).event.findMany();
  }

  async findOne(id: string): Promise<Event | null> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await (this.prisma as any).event.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: Prisma.EventUpdateInput): Promise<Event> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await (this.prisma as any).event.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<Event> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await (this.prisma as any).event.delete({
      where: { id },
    });
  }
}
