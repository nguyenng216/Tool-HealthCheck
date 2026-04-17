import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CheckResultDto } from './check-result.dto';

export class DiagnoseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckResultDto)
  checks!: CheckResultDto[];
}
