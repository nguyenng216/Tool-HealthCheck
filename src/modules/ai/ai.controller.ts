import { Body, Controller, Post } from '@nestjs/common';
import { DiagnoseDto } from './dto/diagnose.dto';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('analyze')
  analyze(@Body() payload: DiagnoseDto) {
    return this.aiService.analyze(payload);
  }
}
