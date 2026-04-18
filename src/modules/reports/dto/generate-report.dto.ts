import { IsObject, IsOptional, IsString } from 'class-validator';

export class GenerateReportDto {
  @IsString()
  title!: string;

  @IsString()
  summary!: string;

  @IsString()
  format!: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
