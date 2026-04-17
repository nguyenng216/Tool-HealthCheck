import { IsIP, IsOptional, IsString } from 'class-validator';

export class SnmpQueryDto {
  @IsIP()
  target!: string;

  @IsString()
  community!: string;

  @IsString()
  oid!: string;

  @IsOptional()
  @IsString()
  version?: string;
}
}
