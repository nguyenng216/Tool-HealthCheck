import { DiagnoseDto } from './dto/diagnose.dto';
import { AiService } from './ai.service';
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    analyze(payload: DiagnoseDto): Promise<import("./interfaces/diagnosis.interface").DiagnosisResult>;
}
