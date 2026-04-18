import { IsIP, IsInt, IsOptional, IsString } from 'class-validator';

export class SshCommandDto {
  @IsIP()
  target!: string;

  @IsString()
  username!: string;

  @IsString()
  password!: string;

  @IsOptional()
  @IsInt()
  port?: number;

  @IsOptional()
  @IsString()
  command?: string;

  @IsOptional()
  @IsString()
  commandKey?: string;

  @IsOptional()
  @IsString()
  adapter?: string;
}
