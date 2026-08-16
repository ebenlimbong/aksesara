import { Injectable, Logger } from '@nestjs/common';
import { GroqAiProvider, FormAssistPayload, FormAssistResult } from './groq-ai.provider';
import { GeminiAiProvider } from './gemini-ai.provider';
import { MockAiProvider } from './mock-ai.provider';

@Injectable()
export class AiAssistanceService {
  private readonly logger = new Logger(AiAssistanceService.name);

  constructor(
    private readonly groqAiProvider: GroqAiProvider,
    private readonly geminiAiProvider: GeminiAiProvider,
    private readonly mockAiProvider: MockAiProvider,
  ) {}

  async processFieldAssistance(payload: any): Promise<{ fields: any[] }> {
    this.logger.log('Memproses AI bantuan formulir...');

    const rawFields = payload.fields || (Array.isArray(payload) ? payload : [payload]);

    const results = await Promise.all(
      rawFields.map(async (field: any) => {
        const providerType = (process.env.AI_PROVIDER || 'groq').toLowerCase();

        if (providerType === 'gemini') {
          try {
            const out = await this.geminiAiProvider.generateFieldAssistance({
              nodeId: field.nodeId || 'node-1',
              officialLabel: field.officialLabel || field.label || 'Field',
              fieldType: field.fieldType || 'text',
              instruction: field.instruction || field.helpText || '',
            });
            return {
              nodeId: out.nodeId,
              simpleLabel: out.simpleLabel,
              helpText: out.helpText,
              exampleFormat: out.exampleFormat,
              source: 'gemini',
            };
          } catch (e) {
            this.logger.warn(`Gemini provider error: ${e.message}. Fallback ke Groq/Mock`);
          }
        }

        try {
          const out = await this.groqAiProvider.generateAssist({
            nodeId: field.nodeId || 'node-1',
            officialLabel: field.officialLabel || field.label || 'Field',
            fieldType: field.fieldType || 'text',
            instruction: field.instruction || field.helpText || '',
            requestedMode: field.requestedMode || 'explanation',
          });
          return {
            nodeId: out.nodeId,
            helpText: out.helpText,
            exampleFormat: out.exampleFormat,
            source: 'groq',
          };
        } catch (e) {
          const out = await this.mockAiProvider.generateFieldAssistance({
            nodeId: field.nodeId || 'node-1',
            officialLabel: field.officialLabel || field.label || 'Field',
            fieldType: field.fieldType || 'text',
          });
          return {
            nodeId: out.nodeId,
            simpleLabel: out.simpleLabel,
            helpText: out.helpText,
            exampleFormat: out.exampleFormat,
            source: 'fallback',
          };
        }
      })
    );

    return { fields: results };
  }
}