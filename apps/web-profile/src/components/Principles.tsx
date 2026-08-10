'use client';

import React, { useState } from 'react';

export default function Principles() {
  const [activeTab, setActiveTab] = useState<number | null>(null);

  const principles = [
    {
      icon: '🛡️',
      title: 'Privacy First & Local-First',
      tagline: '100% Data Tetap di Perangkat Anda',
      description: 'Semua pemrosesan data, pengenalan bidang formulir, hingga penyederhanaan teks berjalan secara lokal di browser Anda tanpa pernah dikirimkan ke server pihak ketiga.',
      stats: '0 Server Logs',
    },
    {
      icon: '💡',
      title: 'AI-Powered Simplification',
      tagline: 'Bantuan Memahami Istilah Sulit',
      description: 'Mengubah bahasa birokrasi, hukum, atau formulir publik yang rumit menjadi kalimat sederhana dan menyajikan contoh format pengisian secara instan.',
      stats: 'Bebas Beban Kognitif',
    },
    {
      icon: '♿',
      title: 'Standar WCAG 2.2 AAA',
      tagline: 'Aksesibilitas Kelas Dunia',
      description: 'Memenuhi pedoman aksesibilitas tertinggi untuk membantu penyandang disabilitas sensorik, motorik, maupun penglihatan rendah (*low vision*).',
      stats: 'AAA Certified',
    },
  ];

  return (
    <section id="tentang" className="py-16 sm:py-24 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-center">
        
        {/* Header Section */}
        <div className="space-y-3 max-w-3xl mx-auto">
          <span className="text-xs font-bold font-sans text-[#003399] tracking-widest uppercase bg-blue-50 border border-blue-200 px-3 py-1 rounded-full inline-block">
            Prinsip Utama Aksesara
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-extrabold text-slate-900 leading-snug">
            Dibangun dengan Mengutamakan Kebebasan Pengguna & Inklusivitas Tanpa Hambatan
          </h2>
        </div>

        {/* Interactive Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 font-sans">
          {principles.map((p, idx) => (
            <div
              key={idx}
              onMouseEnter={() => setActiveTab(idx)}
              onMouseLeave={() => setActiveTab(null)}
              className={`p-7 rounded-2xl text-left border transition-all duration-300 relative group cursor-pointer ${
                activeTab === idx
                  ? 'bg-blue-50/40 border-[#003399] shadow-xl -translate-y-1.5'
                  : 'bg-[#f8fafc] border-slate-200/90 shadow-sm hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-[#003399] text-white rounded-xl flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform">
                  {p.icon}
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-600 shadow-2xs">
                  {p.stats}
                </span>
              </div>

              <h3 className="text-lg font-serif font-bold text-slate-900 group-hover:text-[#003399] transition-colors">
                {p.title}
              </h3>
              
              <div className="text-xs font-semibold text-[#003399] mt-1 mb-3">
                {p.tagline}
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {p.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}