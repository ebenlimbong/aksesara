import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AiAssistanceService } from './ai-assistance.service';
import { AssistFieldsRequestSchema, AssistFieldsRequest } from '@aksesara/form-schema';

@ApiTags('AI Assistance')
@Controller('assist')
export class AiAssistanceController {
  constructor(private readonly aiService: AiAssistanceService) {}

  @Post('fields')
  @ApiOperation({ summary: 'Menghasilkan bantuan bahasa sederhana & petunjuk dari metadata yang telah disanitasi' })
  @ApiResponse({ status: 200, description: 'Bantuan bahasa berhasil dihasilkan' })
  @ApiResponse({ status: 400, description: 'Payload memuat properti terlarang' })
  async assistFields(@Body() body: AssistFieldsRequest) {
    const parsed = AssistFieldsRequestSchema.parse(body);
    return this.aiService.processFieldAssistance(parsed);
  }

  @Post('simplify-fields')
  async simplifyFields(@Body() body: AssistFieldsRequest) {
    const parsed = AssistFieldsRequestSchema.parse(body);
    return this.aiService.processFieldAssistance(parsed);
  }
}
