import { Injectable, Logger } from '@nestjs/common';
import { GroqAiProvider, FormAssistPayload, FormAssistResult } from './groq-ai.provider';

@Injectable()
export class AiAssistanceService {
  private readonly logger = new Logger(AiAssistanceService.name);

  constructor(private readonly groqAiProvider: GroqAiProvider) {}

  async processFieldAssistance(payload: { fields: FormAssistPayload[] }): Promise<{ fields: FormAssistResult[] }> {
    this.logger.log('Memproses AI bantuan formulir menggunakan Groq AI...');

    const results = await Promise.all(
      payload.fields.map((field) => this.groqAiProvider.generateAssist(field))
    );

    return { fields: results };
  }
}