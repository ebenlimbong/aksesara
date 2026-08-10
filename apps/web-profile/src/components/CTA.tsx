'use client';

import React from 'react';

export default function CTA() {
  return (
    <section id="download" className="py-16 sm:py-20 bg-[#003399] text-white text-center relative overflow-hidden">
      {/* Background Subtle Circles */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
        <span className="px-3.5 py-1.5 rounded-full bg-blue-800/80 text-blue-200 text-xs font-bold uppercase tracking-wider font-sans border border-blue-700 inline-block">
          Ekstensi Gratis & Open-Source
        </span>

        <h2 className="text-2xl sm:text-4xl font-serif font-extrabold leading-tight">
          Mulai Pengalaman Pengisian Web yang Ramah Aksesibilitas Sekarang
        </h2>

        <p className="text-blue-100 text-sm sm:text-base max-w-2xl mx-auto font-sans leading-relaxed opacity-90">
          Dapatkan kebebasan mengisi berbagai formulir digital tanpa kebingungan. Kompatibel dengan semua browser modern tanpa pengumpulan data pribadi.
        </p>

        {/* Download Buttons Container */}
        <div className="flex flex-wrap justify-center gap-3.5 pt-4 font-sans text-xs sm:text-sm font-bold">
          <a
            href="#"
            className="bg-white hover:bg-slate-100 active:scale-95 text-[#003399] px-6 py-3.5 rounded-xl shadow-lg flex items-center gap-2.5 transition-all"
          >
            <span>🌐</span>
            <span>Pasang di Chrome</span>
          </a>

          <a
            href="#"
            className="bg-blue-800 hover:bg-blue-700 active:scale-95 text-white px-6 py-3.5 rounded-xl border border-blue-600 shadow-md flex items-center gap-2.5 transition-all"
          >
            <span>🦊</span>
            <span>Firefox Add-ons</span>
          </a>

          <a
            href="#"
            className="bg-blue-800 hover:bg-blue-700 active:scale-95 text-white px-6 py-3.5 rounded-xl border border-blue-600 shadow-md flex items-center gap-2.5 transition-all"
          >
            <span>🧭</span>
            <span>Microsoft Edge</span>
          </a>
        </div>
      </div>
    </section>
  );
}