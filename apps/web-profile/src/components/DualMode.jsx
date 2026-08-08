import React from 'react';
import { Globe, CheckCircle2 } from 'lucide-react';

export const DualMode = () => {
  return (
    <section className="py-16 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-4">Dua Pendekatan Aksesibilitas</h2>
        <p className="text-center text-slate-600 max-w-2xl mx-auto mb-12">
          Aksesara mengusung prinsip <span className="font-semibold text-primary-600">extension-first, integration-enhanced</span>.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-6">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">1. Mode Universal</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              Digunakan saat website belum bekerja sama. Aksesara mendeteksi struktur formulir secara otomatis melalui ekstraksi DOM, menghubungkan label dengan input, serta menggunakan AI untuk merangkum instruksi yang rumit.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-6">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">2. Mode Terverifikasi</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              Website mitra memasang Aksesara Bridge SDK. Metadata formulir didaftarkan dan diverifikasi langsung oleh instansi terkait untuk memberikan tingkat kepastian dan keakuratan pemetaan data sebesar 100%.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};