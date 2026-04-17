import { GenerateReportDto } from './dto/generate-report.dto';
import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    generate(payload: GenerateReportDto): Promise<import("./interfaces/report.interface").Report>;
    findOne(id: string): Promise<import("./interfaces/report.interface").Report>;
}
