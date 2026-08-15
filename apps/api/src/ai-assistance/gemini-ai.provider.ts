import { Injectable, Logger } from '@nestjs/common';
import { SanitizedFieldInput, FieldAssistanceOutput, AiAssistanceProvider } from './mock-ai.provider';

@Injectable()
export class GeminiAiProvider implements AiAssistanceProvider {
  private readonly logger = new Logger(GeminiAiProvider.name);

  async generateFieldAssistance(input: SanitizedFieldInput): Promise<FieldAssistanceOutput> {
    const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;
    const model = process.env.AI_MODEL || process.env.GEMINI_MODEL || 'gemini-3.6-flash';

    if (!apiKey) {
      this.logger.warn('AI_API_KEY tidak terkonfigurasi. Kembali menggunakan fallback.');
      throw new Error('AI_API_KEY tidak ditemukan');
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const prompt = `Anda adalah Aksesara AI Engine, asisten aksesibilitas formulir web ramah disabilitas (WCAG 2.2 AAA).
Tugas Anda adalah memberikan (1) Penjelasan Singkat Lengkap mengenai maksud pertanyaan formulir dan (2) Contoh Jawaban Nyata.

DILARANG KERAS mengulang label pertanyaan sebagai penjelasan atau menjawab HANYA 1 KATA (contoh: jika label "Telepon", JANGAN menjawab "Telepon", melainkan "Isikan nomor telepon aktif yang dapat dihubungi melalui SMS atau WhatsApp.").

Label Formulir: "${input.officialLabel}"
Tipe Input: "${input.fieldType}"

Aturan Respons:
1. "helpText": Kalimat penjelasan 1-2 kalimat lengkap (10-20 kata) yang sangat mudah dipahami.
2. "exampleFormat": Berikan 2-3 contoh jawaban nyata yang tepat dan realistis.

Balas HANYA dalam format JSON valid berikut tanpa teks markdown tambahan:
{
  "helpText": "Isikan ...",
  "exampleFormat": "Contoh: ..."
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

      rawContent = rawContent.replace(/```json/gi, '').replace(/```/g, '').trim();

      let parsed: { simpleLabel?: string; helpText?: string; exampleFormat?: string } = {};
      try {
        parsed = JSON.parse(rawContent);
      } catch (e) {
        this.logger.warn('Gagal memparsing JSON dari Gemini response, menggunakan fallback parser.');
      }

      return {
        nodeId: input.nodeId,
        simpleLabel: parsed.helpText || `Isikan data ${input.officialLabel} sesuai dokumen resmi Anda.`,
        helpText: parsed.helpText || `Isikan data ${input.officialLabel} sesuai dokumen resmi Anda.`,
        exampleFormat: parsed.exampleFormat || '',
        warnings: [],
        confidence: 0.95,
      };
    } catch (error) {
      this.logger.error('Error saat menghubungi Google Gemini API:', error);
      throw error;
    }
  }
}
