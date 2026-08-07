import { Injectable, Logger } from '@nestjs/common';
import { SanitizedFieldInput, FieldAssistanceOutput } from '@aksesara/form-schema';
import { AiAssistanceProvider } from './mock-ai.provider';

@Injectable()
export class GeminiAiProvider implements AiAssistanceProvider {
  private readonly logger = new Logger(GeminiAiProvider.name);

  async generateFieldAssistance(input: SanitizedFieldInput): Promise<FieldAssistanceOutput> {
    const apiKey = process.env.AI_API_KEY;
    const model = process.env.AI_MODEL || 'gemini-2.5-flash';

    if (!apiKey) {
      this.logger.warn('AI_API_KEY tidak terkonfigurasi. Kembali menggunakan fallback.');
      throw new Error('AI_API_KEY tidak ditemukan');
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const prompt = `Anda adalah Aksesara AI Engine, asisten aksesibilitas formulir web. 
Tugas Anda adalah memberikan (1) Penjelasan Singkat Pertanyaan dan (2) Contoh Jawaban Nyata untuk label formulir web berikut.

Label Formulir: "${input.officialLabel}"
Tipe Input: "${input.fieldType}"

Aturan Respons:
1. "simpleLabel": Pertanyaan singkat bahasa sehari-hari.
2. "helpText": Penjelasan pertanyaan dalam 1 KALIMAT PENDEK yang sangat mudah dipahami.
3. "exampleFormat": Berikan 2-3 contoh jawaban nyata yang tepat dan realistis (misal untuk tempat lahir: "Bandung, Jakarta, Medan", untuk kecamatan: "Kec. Coblong, Kec. Sukajadi").

JANGAN membuat penjelasan atau contoh yang terlalu panjang.

Balas HANYA dalam format JSON valid berikut tanpa teks markdown tambahan:
{
  "simpleLabel": "...",
  "helpText": "...",
  "exampleFormat": "..."
}`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        this.logger.error(`Google Gemini API error status ${response.status}: ${errText}`);
        throw new Error(`Gemini API HTTP Error ${response.status}`);
      }

      const data = await response.json();
      let rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Clean markdown code blocks if present
      rawContent = rawContent.replace(/```json/gi, '').replace(/```/g, '').trim();

      let parsed: { simpleLabel?: string; helpText?: string; exampleFormat?: string } = {};
      try {
        parsed = JSON.parse(rawContent);
      } catch (e) {
        this.logger.warn('Gagal memparsing JSON dari Gemini response, menggunakan fallback parser.');
      }

      return {
        nodeId: input.nodeId,
        simpleLabel: parsed.simpleLabel || `Berapa ${input.officialLabel}?`,
        helpText: parsed.helpText || 'Isikan data yang sesuai dengan dokumen resmi Anda.',
        exampleFormat: parsed.exampleFormat || '',
        warnings: [],
        confidence: 0.95,
        verificationStatus: 'unverified-ai',
      };
    } catch (error) {
      this.logger.error('Error saat menghubungi Google Gemini API:', error);
      throw error;
    }
  }
}
