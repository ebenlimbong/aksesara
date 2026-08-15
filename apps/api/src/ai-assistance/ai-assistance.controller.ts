import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AiAssistanceService } from './ai-assistance.service';

@ApiTags('AI Assistance')
@Controller()
export class AiAssistanceController {
  constructor(private readonly aiService: AiAssistanceService) {}

  @Post('assist/fields')
  @ApiOperation({ summary: 'Menghasilkan bantuan bahasa sederhana & petunjuk dari metadata yang telah disanitasi' })
  @ApiResponse({ status: 200, description: 'Bantuan bahasa berhasil dihasilkan' })
  @ApiResponse({ status: 400, description: 'Payload memuat properti terlarang' })
  async assistFields(@Body() body: any) {
    return this.aiService.processFieldAssistance(body);
  }

  @Post('assist/simplify-fields')
  async simplifyFields(@Body() body: any) {
    return this.aiService.processFieldAssistance(body);
  }

  @Post('ai/field-assistance')
  async aiFieldAssistance(@Body() body: any) {
    return this.aiService.processFieldAssistance(body);
  }
}
