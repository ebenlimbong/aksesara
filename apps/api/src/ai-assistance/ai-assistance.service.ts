import { Injectable, BadRequestException } from '@nestjs/common';
import { MockAiProvider } from './mock-ai.provider';
import { AssistFieldsRequest, AssistFieldsResponse } from '@aksesara/form-schema';

@Injectable()
export class AiAssistanceService {
  constructor(private readonly mockAiProvider: MockAiProvider) {}

  async processFieldAssistance(dto: AssistFieldsRequest): Promise<AssistFieldsResponse> {
    const results = [];

    for (const field of dto.fields) {
      // Security Sanitizer: Reject if forbidden properties exist
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

      const output = await this.mockAiProvider.generateFieldAssistance(field);
      results.push(output);
    }

    return { fields: results };
  }
}
