import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-10 font-sans text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-100 pb-6">
          
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-lg bg-[#003399] text-white flex items-center justify-center font-serif font-bold text-sm">
              A
            </div>
            <span className="font-serif font-bold text-lg text-[#003399]">
              Aksesara
            </span>
          </div>

          {/* Quick Nav */}
          <div className="flex flex-wrap justify-center space-x-6 text-slate-600 font-medium">
            <a href="#beranda" className="hover:text-[#003399] transition-colors">Beranda</a>
            <a href="#tentang" className="hover:text-[#003399] transition-colors">Tentang</a>
            <a href="#cara-kerja" className="hover:text-[#003399] transition-colors">Cara Kerja</a>
            <a href="#download" className="hover:text-[#003399] transition-colors">Dokumentasi</a>
          </div>

        </div>

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] text-slate-400">
          <div>
            &copy; 2026 Aksesara Platform. Seluruh Hak Cipta Dilindungi.
          </div>
          <div>
            Inisiatif Aksesibilitas Digital Indonesia • Ditujukan untuk WCAG 2.2 AAA Compliance.
          </div>
        </div>

      </div>
    </footer>
  );
}