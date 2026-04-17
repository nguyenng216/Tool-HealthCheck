import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { Role } from '../../common/constants/roles.constant';

export class RegisterUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsEnum(Role)
  role!: Role;
}
