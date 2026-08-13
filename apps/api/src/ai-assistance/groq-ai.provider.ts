import { Injectable, Logger } from '@nestjs/common';
import Groq from 'groq-sdk';

export interface FormAssistPayload {
  nodeId: string;
  officialLabel: string;
  fieldType: string;
  instruction?: string;
  requestedMode?: 'explanation' | 'example';
}

export interface FormAssistResult {
  nodeId: string;
  helpText: string;
  exampleFormat: string;
}

@Injectable()
export class GroqAiProvider {
  private readonly logger = new Logger(GroqAiProvider.name);
  private groq: Groq;

  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  async generateAssist(field: FormAssistPayload): Promise<FormAssistResult> {
    const prompt = `
SYSTEM PROMPT:
Kamu adalah "Aksesara AI", asisten aksesibilitas formulir web ramah disabilitas (WCAG 2.2 AAA).
Tugasmu adalah menganalisis input formulir dan memberikan panduan yang SANGAT RINGKAS dan MUDAH DIPAHAMI.

ATURAN STRICT:
1. Kembalikan HANYA JSON murni tanpa markdown/backtick.
2. Gunakan Bahasa Indonesia yang ramah dan inklusif.

INPUT FORMULIR:
- Label Input: "${field.officialLabel}"
- Tipe Input: "${field.fieldType}"
- Petunjuk Tambahan: "${field.instruction || 'Tidak ada'}"
- Mode Permintaan: "${field.requestedMode || 'explanation'}"

FORMAT JSON HARUS SEPERTI INI:
{
  "helpText": "Penjelasan 1-2 kalimat ringkas mengenai maksud kolom ini.",
  "exampleFormat": "Contoh isian yang valid (contoh: 3171012345670001 atau nama@email.com)"
}
    `;

    try {
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Kamu adalah Aksesara AI. Output wajib berupa JSON valid.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' },
        temperature: 0.2,
      });

      const responseText = completion.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(responseText);

      return {
        nodeId: field.nodeId,
        helpText: parsed.helpText || `Isikan data ${field.officialLabel} sesuai dokumen resmi Anda.`,
        exampleFormat: parsed.exampleFormat || 'Contoh: Data Valid',
      };
    } catch (error) {
      this.logger.error('Gagal mendapatkan respon dari Groq API:', error);
      return {
        nodeId: field.nodeId,
        helpText: `Isikan data ${field.officialLabel} sesuai dokumen resmi Anda.`,
        exampleFormat: field.fieldType === 'number' ? 'Contoh: 12345678' : 'Contoh: Budi Santoso',
      };
    }
  }
}