import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

interface RegisterBody {
  fullName: string;
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

@Controller('auth')
export class AppController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  async register(@Body() body: RegisterBody) {
    const { fullName, email, password } = body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: { fullName, email, password: hashedPassword },
    });

    const access_token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return {
      message: 'User registered successfully',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        createdAt: user.createdAt,
      },
      access_token,
    };
  }

  @Post('login')
  async login(@Body() body: LoginBody) {
    const { email, password } = body;

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user?.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const access_token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return {
      message: 'Login successful',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        createdAt: user.createdAt,
      },
      access_token,
    };
  }

  @Post('events')
  async createEvent(@Body() body: Record<string, any>) {
    const { title, description, date, time, location } = body;

    // Конвертуємо отримані з фронтенду дату та час у об'єкт Date
    const eventDate = new Date(`${String(date)}T${String(time)}`);

    const newEvent = await this.prisma.event.create({
      data: {
        title: String(title),
        description: String(description),
        location: String(location),
        startDate: eventDate,
      },
    });

    return newEvent;
  }
}
