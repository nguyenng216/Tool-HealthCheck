import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GenerateReportDto } from './dto/generate-report.dto';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  generate(@Body() payload: GenerateReportDto) {
    return this.reportsService.generate(payload);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(Number(id));
  }
}
