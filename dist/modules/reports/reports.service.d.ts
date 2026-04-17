import { PrismaService } from '../../prisma/prisma.service';
import { GenerateReportDto } from './dto/generate-report.dto';
import { Report } from './interfaces/report.interface';
export declare class ReportsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    generate(payload: GenerateReportDto): Promise<Report>;
    findOne(id: number): Promise<Report>;
}
