import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export enum ExecutionMode {
  Parallel = 'parallel',
  Sequence = 'sequence',
}

export class RunHealthcheckDto {
  @IsInt()
  deviceId!: number;

  @IsOptional()
  @IsString()
  policy?: string;

  @IsOptional()
  @IsEnum(ExecutionMode)
  mode?: ExecutionMode;
}

  @IsOptional()
  @IsEnum(ExecutionMode)
  mode?: ExecutionMode;
}
