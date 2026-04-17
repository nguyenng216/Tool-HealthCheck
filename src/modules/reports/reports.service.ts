import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GenerateReportDto } from './dto/generate-report.dto';
import { Report } from './interfaces/report.interface';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async generate(payload: GenerateReportDto): Promise<Report> {
    const report = await this.prisma.report.create({
      data: {
        title: payload.title,
        summary: payload.summary,
        format: payload.format,
        metadata: payload.metadata as any,
      },
    });
    return { ...report, metadata: report.metadata as Record<string, unknown> };
  }

  async findOne(id: number): Promise<Report> {
    const report = await this.prisma.report.findUnique({ where: { id } });
    if (!report) {
      throw new NotFoundException(`Report ${id} not found`);
    }
    return { ...report, metadata: report.metadata as Record<string, unknown> };
  }
}
