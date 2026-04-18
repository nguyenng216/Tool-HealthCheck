import { Role } from '@prisma/client';
export declare class RegisterUserDto {
    email: string;
    password: string;
    role: Role;
}
