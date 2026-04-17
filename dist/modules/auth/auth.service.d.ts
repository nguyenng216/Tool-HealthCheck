import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from './interfaces/user.interface';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(payload: RegisterUserDto): Promise<Partial<User>>;
    login(payload: LoginDto): Promise<{
        accessToken: string;
    }>;
}
