import { IsIP, IsOptional, IsString } from 'class-validator';

export class CreateDeviceDto {
  @IsString()
  name!: string;

  @IsIP()
  ip!: string;

  @IsString()
  type!: string;

  @IsOptional()
  @IsString()
  credential?: string;
}
