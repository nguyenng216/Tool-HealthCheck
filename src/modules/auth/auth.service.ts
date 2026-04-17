import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from './interfaces/user.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) {}

  async register(payload: RegisterUserDto): Promise<Partial<User>> {
    const hashedPassword = await bcrypt.hash(payload.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: payload.email,
        password: hashedPassword,
        role: payload.role,
      },
    });

    return { id: user.id, email: user.email, role: user.role };
  }

  async login(payload: LoginDto): Promise<{ accessToken: string }> {
    const user = await this.prisma.user.findUnique({ where: { email: payload.email } });
    if (!user || !(await bcrypt.compare(payload.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
    return { accessToken: token };
  }
}
