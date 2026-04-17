import { LoginDto } from './dto/login.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(payload: RegisterUserDto): Promise<Partial<import("./interfaces/user.interface").User>>;
    login(payload: LoginDto): Promise<{
        accessToken: string;
    }>;
}
