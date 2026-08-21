import React from 'react';
import Image from 'next/image';

export default function Hero() {
  return (
    <section id="beranda" className="w-full py-10 sm:py-16 lg:py-20 bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] border-b border-slate-200/80 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* ========================================================= */}
        {/* KOLOM KIRI: TEKS HEADER HERO                              */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 flex flex-col items-start space-y-5 sm:space-y-6 text-left">
          {/* Badge WCAG */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#fef3c7] text-[#92400e] border border-[#fde68a] text-xs font-bold font-sans shadow-sm">
            <span>✨ WCAG 2.2 AAA Compliant</span>
          </div>

          {/* Judul Utama */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-extrabold text-[#003399] leading-[1.18] tracking-tight">
            Pengisian Formulir Web yang Inklusif dan Ramah Aksesibilitas untuk Semua Orang
          </h1>

          {/* Deskripsi */}
          <p className="text-slate-600 text-sm sm:text-base font-sans leading-relaxed">
            Ekstensi browser adaptif yang mendampingi pengisian formulir digital. Dirancang khusus untuk meminimalkan beban kognitif, mengatasi hambatan motorik, dan menyediakan lingkungan baca kontras tinggi yang sepenuhnya aman dan berjalan secara lokal.
          </p>

          {/* Tombol Aksi CTA */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full sm:w-auto font-sans">
            <a
              href="#download"
              className="bg-[#003399] hover:bg-[#002673] active:scale-[0.98] text-white font-bold px-6 py-3.5 rounded-xl flex items-center justify-center gap-2.5 shadow-lg shadow-blue-900/20 transition-all text-sm"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download Ekstensi Browser</span>
            </a>
            
            <a
              href="#cara-kerja"
              className="bg-white border-2 border-[#003399] text-[#003399] hover:bg-blue-50 active:scale-[0.98] font-bold px-6 py-3.5 rounded-xl flex items-center justify-center gap-2.5 transition-all text-sm shadow-sm"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>Lihat Cara Kerja</span>
            </a>
          </div>
        </div>

        {/* ========================================================= */}
        {/* KOLOM KANAN: MOCKUP SIMULASI REALISTIS & RESPONSIF        */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 relative w-full pt-4 lg:pt-0">
          
          {/* Outer Frame Mockup Window */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[460px] transition-all">
            
            {/* 1. SISI KIRI: WEB TARGET (PORTAL LAYANAN DUKCAPIL) */}
            <div className="md:col-span-7 p-4 sm:p-6 bg-white space-y-4 sm:space-y-5 border-b md:border-b-0 md:border-r border-slate-200">
              
              {/* Header Web Dukcapil */}
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 shrink-0 shadow-sm">
                  🏛️
                </div>
                <div>
                  <h3 className="font-serif font-bold text-slate-900 text-xs sm:text-sm leading-tight">
                    Portal Layanan Administrasi Kependudukan
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-sans">
                    Kementerian Dalam Negeri Republik Indonesia
                  </p>
                </div>
              </div>

              {/* Form Title & Instructions */}
              <div className="space-y-1">
                <h4 className="font-serif font-bold text-slate-900 text-sm sm:text-base">
                  Formulir Pendaftaran Data Baru
                </h4>
                <p className="text-[11px] text-slate-500 font-sans leading-snug">
                  Silakan lengkapi formulir di bawah ini dengan data yang benar dan dapat dipertanggungjawabkan.
                </p>
              </div>

              {/* Form Field 1: Nama Lengkap */}
              <div className="space-y-1 font-sans">
                <label className="block text-xs font-serif font-bold text-slate-800">
                  1. Nama Lengkap (Sesuai KTP)
                </label>
                <input
                  type="text"
                  readOnly
                  value="Budi Santoso"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 outline-none"
                />
              </div>

              {/* Form Field 2: NIK (AKTIF - HIGHLIGHTER BORDER BIRU PUTUS-PUTUS) */}
              <div className="relative p-3 rounded-xl border-2 border-dashed border-[#003399] bg-blue-50/30 space-y-1.5 font-sans shadow-sm">
                {/* Active Indicator Pointer */}
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#003399] rounded-full flex items-center justify-center text-white text-[10px] shadow-md">
                  👁️
                </div>

                <label className="block text-xs font-serif font-bold text-slate-900">
                  2. Nomor Induk Kependudukan (NIK) <span className="text-red-500">*</span>
                </label>
                <p className="text-[10px] text-slate-500">
                  Pastikan NIK terdiri dari 16 digit angka.
                </p>
                <input
                  type="text"
                  readOnly
                  placeholder="Masukkan 16 digit NIK"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Form Field 3: Tanggal Lahir */}
              <div className="space-y-1 font-sans">
                <label className="block text-xs font-serif font-bold text-slate-800">
                  3. Tanggal Lahir
                </label>
                <input
                  type="text"
                  readOnly
                  placeholder="mm/dd/yyyy"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-400 font-mono outline-none"
                />
              </div>

            </div>

            {/* 2. SISI KANAN: SIDEPANEL AKSESARA (FORM ASSISTANT) */}
            <div className="md:col-span-5 bg-[#f8fafc] p-4 sm:p-5 flex flex-col justify-between font-serif space-y-4">
              
              <div className="space-y-3.5">
                {/* Header Sidepanel */}
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="relative w-7 h-7 flex items-center justify-center shrink-0">
                      <Image
                        src="/Icon.png"
                        alt="Logo Aksesara"
                        width={28}
                        height={28}
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 leading-none">Aksesara</div>
                      <span className="inline-block mt-1 text-[9px] bg-[#fef3c7] text-[#92400e] border border-[#fde68a] px-1.5 py-0.2 rounded-full font-sans font-medium">
                        • Mode Terverifikasi
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">✕</span>
                </div>

                {/* Tombol Pindai Ulang Form */}
                <button className="w-full py-2 px-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1.5 font-sans shadow-sm transition-all">
                  <span>🔄</span>
                  <span>Pindai Ulang Form</span>
                </button>

                {/* Accessibility Controls Toolbar */}
                <div className="p-1.5 bg-slate-200/60 rounded-xl flex items-center justify-between border border-slate-200 font-sans">
                  <div className="flex items-center space-x-1 bg-white p-0.5 rounded-lg shadow-sm">
                    <button className="px-2 py-0.5 text-[10px] text-slate-500 font-medium">A</button>
                    <button className="px-2 py-0.5 text-[10px] bg-[#e0effe] text-[#003399] font-bold rounded">A+</button>
                    <button className="px-2 py-0.5 text-[10px] text-slate-500 font-medium">A++</button>
                  </div>
                  <div className="w-6 h-6 rounded-lg bg-[#1e293b] text-white flex items-center justify-center text-[10px] shadow-sm">
                    ◑
                  </div>
                </div>

                {/* Progress Step Indicator */}
                <div className="space-y-1 font-sans">
                  <div className="flex justify-between items-center text-[10px] font-bold text-[#003399]">
                    <span>LANGKAH 2 DARI 5</span>
                    <span>40%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#003399] h-full w-[40%] rounded-full transition-all duration-300"></div>
                  </div>
                </div>

                {/* Question Card Assistant */}
                <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-3.5 shadow-sm space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <h5 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                      Nomor Induk Kependudukan (NIK) <span className="text-red-500">*</span>
                    </h5>
                    <button className="p-1.5 bg-[#e0effe] hover:bg-blue-200 text-[#003399] rounded-lg text-xs shrink-0 transition-colors">
                      🔊
                    </button>
                  </div>

                  {/* AI Assistance Buttons */}
                  <div className="flex items-center gap-1.5 font-sans">
                    <button className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-[10px] text-slate-700 font-semibold flex items-center gap-1 transition-all">
                      <span>💡</span> Jelaskan (AI)
                    </button>
                    <button className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-[10px] text-slate-700 font-semibold flex items-center gap-1 transition-all">
                      <span>📝</span> Contoh (AI)
                    </button>
                  </div>

                  {/* Input Assistant */}
                  <div className="space-y-1 pt-0.5">
                    <span className="text-[9px] text-slate-500 font-sans block">Ketik jawaban Anda di sini:</span>
                    <input
                      type="text"
                      readOnly
                      placeholder="Contoh: 3171234567890123"
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-400 outline-none"
                    />
                  </div>

                  <div className="text-[9px] text-slate-400 font-sans flex items-center gap-1">
                    <span>⋮⋮</span>
                    <span>16 angka</span>
                  </div>
                </div>

              </div>

              {/* Footer Navigation Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 font-sans">
                <button className="py-2.5 px-3 bg-[#e2e8f0] hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors">
                  <span>←</span> Kembali
                </button>
                <button className="py-2.5 px-3 bg-[#003399] hover:bg-[#002673] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-md transition-all">
                  Lanjut <span>→</span>
                </button>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}