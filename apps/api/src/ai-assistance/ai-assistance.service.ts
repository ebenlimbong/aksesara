import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { MockAiProvider } from './mock-ai.provider';
import { GeminiAiProvider } from './gemini-ai.provider';
import { AssistFieldsRequest, AssistFieldsResponse } from '@aksesara/form-schema';

@Injectable()
export class AiAssistanceService {
  private readonly logger = new Logger(AiAssistanceService.name);

  constructor(
    private readonly mockAiProvider: MockAiProvider,
    private readonly geminiAiProvider: GeminiAiProvider,
  ) {}

  async processFieldAssistance(dto: AssistFieldsRequest): Promise<AssistFieldsResponse> {
    const results = [];
    const providerType = (process.env.AI_PROVIDER || 'mock').toLowerCase();

    for (const field of dto.fields) {
      // Security Sanitizer Gatekeeper: Reject if forbidden properties exist
      const rawString = JSON.stringify(field).toLowerCase();
      if (
        rawString.includes('"value"') ||
        rawString.includes('"answer"') ||
        rawString.includes('"password"') ||
        rawString.includes('"cookie"') ||
        rawString.includes('"token"')
      ) {
        throw new BadRequestException(
          'Permintaan ditolak: Metadata formulir memuat properti sensitif atau nilai pengguna.'
        );
      }

      let output;
      if (providerType === 'gemini') {
        try {
          this.logger.log(`Memproses bidang "${field.officialLabel}" menggunakan Google Gemini API...`);
          output = await this.geminiAiProvider.generateFieldAssistance(field);
        } catch (error) {
          this.logger.warn(`Gagal memproses via Gemini AI. Kembali ke MockAiProvider: ${error.message}`);
          output = await this.mockAiProvider.generateFieldAssistance(field);
        }
      } else {
        output = await this.mockAiProvider.generateFieldAssistance(field);
      }

      results.push(output);
    }

    return { fields: results };
  }
}
