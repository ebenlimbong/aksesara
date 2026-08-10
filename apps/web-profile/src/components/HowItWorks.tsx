'use client';

import React, { useState } from 'react';

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [copied, setCopied] = useState(false);

  const steps = [
    {
      num: '1',
      title: 'Deteksi Otomatis Formulir Web',
      desc: 'Buka halaman formulir publik mana pun di browser. Ekstensi Aksesara secara instan memindai dan memetakan struktur form secara lokal.',
      detail: 'Mendukung input teks, angka, dropdown select, tanggal, hingga dokumen pendukung.',
    },
    {
      num: '2',
      title: 'Pilih Preferensi Aksesibilitas',
      desc: 'Atur ukuran font (A, A+, A++), aktifkan Mode Kontras Tinggi, atau nyalakan pembaca suara (Text-to-Speech) sesuai kenyamanan Anda.',
      detail: 'Tampilan formulir disesuaikan tanpa merusak struktur asli situs web target.',
    },
    {
      num: '3',
      title: 'Bantuan AI & Autofill Instan',
      desc: 'Dapatkan penjelasan istilah dan contoh format pengisian dari AI Lokal, lalu kirimkan jawaban secara aman ke formulir asli.',
      detail: 'Selesai diisi dengan cepat, akurat, dan ramah pengguna.',
    },
  ];

  const codeSnippet = `import { initBridge } from '@aksesara/bridge';

// Inisialisasi bridge pada formulir web Anda
initBridge({
  formSelector: '#registration-form',
  theme: 'accessible-light',
  accessibilityOptions: {
    highContrast: true,
    speechToText: true
  }
});`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="cara-kerja" className="py-16 sm:py-24 bg-[#f8fafc] border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="space-y-3 text-center sm:text-left">
          <span className="text-xs font-bold font-sans text-[#003399] tracking-widest uppercase bg-blue-50 border border-blue-200 px-3 py-1 rounded-full inline-block">
            Cara Kerja Aksesara
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-extrabold text-slate-900">
            3 Langkah Mudah Pengisian Formulir Tanpa Kendala
          </h2>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Interactive Steps List (Kiri) */}
          <div className="lg:col-span-7 space-y-4 font-sans">
            {steps.map((step, idx) => (
              <div
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex gap-4 items-start ${
                  activeStep === idx
                    ? 'bg-white border-[#003399] shadow-lg ring-1 ring-[#003399]/20'
                    : 'bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                    activeStep === idx
                      ? 'bg-[#003399] text-white shadow-md'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {step.num}
                </div>

                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-slate-900 text-base">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                  {activeStep === idx && (
                    <div className="text-[11px] text-[#003399] font-medium pt-1 animate-fadeIn">
                      💡 {step.detail}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Developer Code Box (Kanan) */}
          <div className="lg:col-span-5 bg-[#0f172a] rounded-2xl p-5 text-slate-200 space-y-3 font-mono text-xs shadow-2xl border border-slate-800">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 font-sans">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
                <span className="text-xs text-slate-400 font-bold ml-2">@aksesara/bridge SDK</span>
              </div>
              
              <button
                onClick={handleCopyCode}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-slate-300 transition-colors"
              >
                {copied ? '✓ Salin' : '📋 Copy Code'}
              </button>
            </div>

            <pre className="text-blue-300 overflow-x-auto leading-relaxed p-2 bg-slate-950/60 rounded-xl">
              {codeSnippet}
            </pre>

            <div className="text-[10px] text-slate-400 font-sans pt-1 border-t border-slate-800/80">
              ⚡ Integrasi SDK memungkinkan situs web Anda langsung mendukung fitur Aksesara secara native.
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}