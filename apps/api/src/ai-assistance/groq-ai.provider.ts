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
      apiKey: process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY || 'dummy_key',
    });
  }

  async generateAssist(field: FormAssistPayload): Promise<FormAssistResult> {
    const prompt = `
SYSTEM PROMPT:
Kamu adalah "Aksesara AI", asisten aksesibilitas formulir web ramah disabilitas (WCAG 2.2 AAA).
Tugasmu adalah menganalisis input formulir dan memberikan PANDUAN PENJELASAN RINGKAS LENGKAP (1-2 KALIMAT BAHASA INDONESIA SEHARI-HARI) mengenai maksud kolom ini.

PENTING & STRICT:
- DILARANG KERAS menjawab HANYA 1 KATA atau mengulang nama label (contoh: jika label "Telepon", JANGAN menjawab "Telepon", melainkan jelaskan "Isikan nomor telepon aktif yang dapat dihubungi melalui SMS atau WhatsApp.").
- Jika label "NISN", jelaskan "Isikan Nomor Induk Siswa Nasional (NISN) 10 digit yang terdaftar di Kemendikbud."
- Kembalikan HANYA JSON murni tanpa markdown/backtick.

INPUT FORMULIR:
- Label Input: "${field.officialLabel}"
- Tipe Input: "${field.fieldType}"
- Petunjuk Tambahan: "${field.instruction || 'Tidak ada'}"

FORMAT JSON HARUS SEPERTI INI:
{
  "helpText": "Isikan ... (kalimat penjelasan ringkas 10-20 kata yang ramah pengguna)",
  "exampleFormat": "Contoh isian yang valid (contoh: 081234567890 atau 3171012345670001)"
}
    `;

    try {
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Kamu adalah Aksesara AI. Output wajib berupa JSON valid. Jangan pernah menjawab hanya 1 kata.',
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
        helpText: parsed.helpText || `Isikan data ${field.officialLabel} sesuai dengan dokumen resmi Anda.`,
        exampleFormat: parsed.exampleFormat || 'Contoh: Data Valid',
      };
    } catch (error) {
      this.logger.error('Gagal mendapatkan respon dari Groq API:', error);
      let fallbackHelp = `Isikan data ${field.officialLabel} sesuai dengan dokumen resmi Anda.`;
      let fallbackExample = 'Contoh: Data Valid';

      const labelLower = (field.officialLabel || '').toLowerCase();
      if (labelLower.includes('telepon') || labelLower.includes('hp')) {
        fallbackHelp = 'Isikan nomor telepon atau WhatsApp aktif yang dapat dihubungi.';
        fallbackExample = 'Contoh: 081234567890';
      } else if (labelLower.includes('nisn')) {
        fallbackHelp = 'Isikan Nomor Induk Siswa Nasional (NISN) 10 digit yang terdaftar.';
        fallbackExample = 'Contoh: 0051234567';
      } else if (labelLower.includes('nik')) {
        fallbackHelp = 'Isikan Nomor Induk Kependudukan (NIK) 16 digit tertera pada KTP atau KK.';
        fallbackExample = 'Contoh: 3171012345670001';
      } else if (labelLower.includes('email')) {
        fallbackHelp = 'Isikan alamat email aktif untuk menerima konfirmasi atau informasi.';
        fallbackExample = 'Contoh: nama@domain.com';
      } else if (labelLower.includes('lahir')) {
        fallbackHelp = 'Isikan tempat kelahiran Anda sesuai dengan akta atau KTP.';
        fallbackExample = 'Contoh: Bandung';
      }

      return {
        nodeId: field.nodeId,
        helpText: fallbackHelp,
        exampleFormat: fallbackExample,
      };
    }
  }
}