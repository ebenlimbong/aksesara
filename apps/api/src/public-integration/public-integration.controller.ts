import { Controller, Get, Param, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PublicIntegrationService } from './public-integration.service';

@ApiTags('Public Metadata Integration')
@Controller('public')
export class PublicIntegrationController {
  constructor(private readonly publicService: PublicIntegrationService) {}

  @Get('projects/:publicProjectKey/forms/:externalFormId')
  @ApiOperation({ summary: 'Mengambil metadata resmi terverifikasi untuk ekstensi' })
  @ApiResponse({ status: 200, description: 'Metadata formulir terverifikasi' })
  @ApiResponse({ status: 403, description: 'Origin tidak diizinkan' })
  @ApiResponse({ status: 404, description: 'Formulir tidak ditemukan' })
  async getVerifiedMetadata(
    @Param('publicProjectKey') publicKey: string,
    @Param('externalFormId') externalFormId: string,
    @Headers('origin') origin?: string
  ) {
    return this.publicService.getVerifiedFormMetadata(publicKey, externalFormId, origin);
  }
}
