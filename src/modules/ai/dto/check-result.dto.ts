import { IsIn, IsNotEmpty, IsObject, IsString } from 'class-validator';

export class CheckResultDto {
  @IsString()
  @IsNotEmpty()
  checkName!: string;

  @IsString()
  @IsIn(['OK', 'WARNING', 'CRITICAL'])
  status!: 'OK' | 'WARNING' | 'CRITICAL';

  @IsObject()
  metrics!: Record<string, unknown>;

  @IsString()
  message!: string;
}
