import { Injectable } from '@nestjs/common';
import { SanitizedFieldInput, FieldAssistanceOutput } from '@aksesara/form-schema';

export interface AiAssistanceProvider {
  generateFieldAssistance(input: SanitizedFieldInput): Promise<FieldAssistanceOutput>;
}

@Injectable()
export class MockAiProvider implements AiAssistanceProvider {
  async generateFieldAssistance(input: SanitizedFieldInput): Promise<FieldAssistanceOutput> {
    const label = input.officialLabel;

    let simpleLabel = `Berapa ${label.toLowerCase()} Anda?`;
    let helpText = 'Masukkan data yang sesuai dengan dokumen resmi Anda.';
    let exampleFormat = '';

    if (/nama/i.test(label)) {
      simpleLabel = 'Berapa nama lengkap Anda?';
      helpText = 'Isikan nama lengkap sesuai KTP atau kartu identitas tanpa gelar.';
      exampleFormat = 'Budi Santoso';
    } else if (/nim|nomor induk/i.test(label)) {
      simpleLabel = 'Berapa Nomor Induk Mahasiswa (NIM) Anda?';
      helpText = 'Masukkan 9 digit nomor mahasiswa aktif Anda.';
      exampleFormat = '120140001';
    } else if (/email|surat elektronik/i.test(label)) {
      simpleLabel = 'Apa alamat email kampus Anda?';
      helpText = 'Pengumuman dan bukti pendaftaran akan dikirimkan ke email ini.';
      exampleFormat = 'nama@student.itera.ac.id';
    } else if (/telepon|whatsapp|hp/i.test(label)) {
      simpleLabel = 'Berapa nomor telepon atau WhatsApp Anda?';
      helpText = 'Pastikan nomor HP dapat menerima pesan atau WhatsApp.';
      exampleFormat = '081234567890';
    } else if (/gaji|penghasilan|income/i.test(label)) {
      simpleLabel = 'Berapa total penghasilan orang tua/wali dalam 1 bulan?';
      helpText = 'Masukkan jumlah pendapatan kotor sebelum dikurangi pengeluaran.';
      exampleFormat = '2500000';
    } else if (/pekerjaan/i.test(label)) {
      simpleLabel = 'Apa pekerjaan utama orang tua atau wali Anda?';
      helpText = 'Pilih salah satu opsi pekerjaan yang tersedia.';
    }

    return {
      nodeId: input.nodeId,
      simpleLabel,
      helpText,
      exampleFormat,
      warnings: [],
      confidence: 0.92,
      verificationStatus: 'unverified-ai',
    };
  }
}
