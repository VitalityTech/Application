/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import {
  BadRequestException,
  ConflictException,
  Controller,
  Post,
  Body,
  Param,
  Get,
  Delete,
  Patch,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

interface RegisterDto {
  fullName: string;
  email: string;
  password: string;
}
interface LoginDto {
  email: string;
  password: string;
}
interface CreateEventDto {
  title: string;
  category?: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity?: number;
  visibility?: 'public' | 'private';
  userId?: string;
}

interface UpdateEventDto {
  title?: string;
  category?: string;
  description?: string;
  date?: string;
  time?: string;
  location?: string;
  capacity?: number | null;
  visibility?: 'public' | 'private';
  userId: string;
}

@Controller('auth')
export class AppController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    const { fullName, email, password } = body;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let user;
    try {
      user = await this.prisma.user.create({
        data: { fullName, email, password: hashedPassword },
      });
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: string }).code === 'P2002'
      ) {
        throw new ConflictException('User with this email already exists');
      }
      throw error;
    }

    const token = this.jwtService.sign({ userId: user.id });
    const { password: userPassword, ...userWithoutPassword } = user;
    void userPassword;
    return { access_token: token, user: userWithoutPassword };
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    const { email, password } = body;
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Виправлено: додано await для bcrypt та перевірку на null
    if (!user || !(await bcrypt.compare(password, user.password || ''))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({ userId: user.id });
    const { password: userPassword, ...userWithoutPassword } = user;
    void userPassword;
    return { access_token: token, user: userWithoutPassword };
  }

  @Get('events')
  async getAllEvents() {
    return await (this.prisma as any).event.findMany({
      where: { visibility: 'PUBLIC' },
      include: {
        participants: { select: { id: true, fullName: true } },
        _count: { select: { participants: true } },
      },
      orderBy: { startDate: 'asc' },
    });
  }

  @Get('users/me/events')
  async getMyEvents(@Query('userId') userId: string) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return await (this.prisma as any).event.findMany({
      where: {
        OR: [{ userId }, { participants: { some: { id: userId } } }],
      },
      include: { _count: { select: { participants: true } } },
      orderBy: { startDate: 'asc' },
    });
  }

  @Get('users/:userId/events')
  async getUserEvents(@Param('userId') userId: string) {
    return await (this.prisma as any).event.findMany({
      where: {
        OR: [{ userId: userId }, { participants: { some: { id: userId } } }],
      },
      include: { _count: { select: { participants: true } } },
      orderBy: { startDate: 'asc' },
    });
  }

  @Post('events')
  async createEvent(@Body() body: CreateEventDto) {
    const {
      title,
      category,
      description,
      date,
      time,
      location,
      userId,
      capacity,
    } = body;

    // userId ОБОВ'ЯЗКОВО
    if (!userId) {
      throw new BadRequestException('User ID is required to create an event');
    }

    // Перевірка що користувач існує
    const user = await (this.prisma as any).user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new BadRequestException('User does not exist');
    }

    const visibility = body.visibility === 'private' ? 'PRIVATE' : 'PUBLIC';

    const startDate = new Date(`${date}T${time}`);
    if (Number.isNaN(startDate.getTime())) {
      throw new BadRequestException('Invalid date or time');
    }
    if (startDate < new Date()) {
      throw new BadRequestException('Cannot create events in the past');
    }

    return await (this.prisma as any).event.create({
      data: {
        title,
        category: category || 'Інше',
        description,
        location,
        startDate,
        capacity: typeof capacity === 'number' ? capacity : null,
        visibility,
        userId,
      },
    });
  }

  @Patch('events/:id')
  async updateEvent(@Param('id') id: string, @Body() body: UpdateEventDto) {
    const existing = await (this.prisma as any).event.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new BadRequestException('Event not found');
    }
    if (!body.userId || existing.userId !== body.userId) {
      throw new UnauthorizedException('Only organizer can edit this event');
    }

    const updateData: {
      title?: string;
      category?: string;
      description?: string;
      location?: string;
      startDate?: Date;
      capacity?: number | null;
      visibility?: 'PUBLIC' | 'PRIVATE';
    } = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.capacity !== undefined) updateData.capacity = body.capacity;
    if (body.visibility !== undefined) {
      updateData.visibility =
        body.visibility === 'private' ? 'PRIVATE' : 'PUBLIC';
    }
    if (body.date && body.time) {
      const parsedDate = new Date(`${body.date}T${body.time}`);
      if (Number.isNaN(parsedDate.getTime())) {
        throw new BadRequestException('Invalid date or time');
      }
      if (parsedDate < new Date()) {
        throw new BadRequestException('Cannot move event to the past');
      }
      updateData.startDate = parsedDate;
    }

    return await (this.prisma as any).event.update({
      where: { id },
      data: updateData,
      include: { participants: { select: { id: true, fullName: true } } },
    });
  }

  @Get('events/:id')
  async getEventById(@Param('id') id: string) {
    return await (this.prisma as any).event.findUnique({
      where: { id },
      include: {
        participants: { select: { id: true, fullName: true } },
        _count: { select: { participants: true } },
      },
    });
  }

  @Delete('events/:id')
  async deleteEvent(@Param('id') id: string, @Query('userId') userId: string) {
    const existing = await (this.prisma as any).event.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new BadRequestException('Event not found');
    }
    if (!userId || existing.userId !== userId) {
      throw new UnauthorizedException('Only organizer can delete this event');
    }
    return await (this.prisma as any).event.delete({ where: { id } });
  }

  @Post('events/:id/join')
  async joinEvent(@Param('id') id: string, @Body('userId') userId: string) {
    const existing = await (this.prisma as any).event.findUnique({
      where: { id },
      include: { participants: { select: { id: true } } },
    });

    if (!existing) {
      throw new BadRequestException('Event not found');
    }

    const alreadyParticipant = existing.participants.some(
      (p) => p.id === userId,
    );
    if (alreadyParticipant) {
      throw new BadRequestException('Already joined this event');
    }

    if (
      existing.capacity &&
      existing.participants.length >= existing.capacity
    ) {
      throw new BadRequestException('Event is full');
    }

    return await (this.prisma as any).event.update({
      where: { id },
      data: { participants: { connect: { id: userId } } },
      include: { participants: true },
    });
  }

  @Post('events/:id/leave')
  async leaveEvent(@Param('id') id: string, @Body('userId') userId: string) {
    return await (this.prisma as any).event.update({
      where: { id },
      data: { participants: { disconnect: { id: userId } } },
      include: { participants: true },
    });
  }
}
