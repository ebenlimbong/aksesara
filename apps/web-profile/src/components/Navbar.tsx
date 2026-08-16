'use client';

import React, { useState } from 'react';
import Image from 'next/image';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <Image
              src="/Icon.png"
              alt="Logo Aksesara"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </div>
          <span className="text-2xl font-serif font-bold text-[#003399] tracking-tight">
            Aksesara
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-sans font-medium text-slate-600">
          <a href="#beranda" className="text-[#003399] font-bold border-b-2 border-[#003399] pb-1 transition-all">
            Beranda
          </a>
          <a href="#tentang" className="hover:text-[#003399] transition-colors">
            Tentang
          </a>
          <a href="#cara-kerja" className="hover:text-[#003399] transition-colors">
            Cara Kerja
          </a>
          <a href="#download" className="hover:text-[#003399] transition-colors">
            Dokumentasi & Unduh
          </a>
        </nav>

        {/* Action Button & Mobile Toggle */}
        <div className="flex items-center space-x-3">
          <a
            href="#download"
            className="hidden sm:inline-flex bg-[#003399] hover:bg-[#002673] text-white font-sans font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-900/10 active:scale-95"
          >
            Pasang Ekstensi
          </a>

          {/* Hamburger Menu Button (Mobile) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 font-sans text-sm animate-fadeIn">
          <a
            href="#beranda"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-[#003399] font-bold border-l-4 border-[#003399] pl-3"
          >
            Beranda
          </a>
          <a
            href="#tentang"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-slate-600 hover:text-[#003399] pl-3"
          >
            Tentang
          </a>
          <a
            href="#cara-kerja"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-slate-600 hover:text-[#003399] pl-3"
          >
            Cara Kerja
          </a>
          <a
            href="#download"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-slate-600 hover:text-[#003399] pl-3"
          >
            Dokumentasi & Unduh
          </a>
          <div className="pt-2">
            <a
              href="#download"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full block text-center bg-[#003399] text-white font-bold py-3 rounded-xl shadow-md"
            >
              Pasang Ekstensi
            </a>
          </div>
        </div>
      )}
    </header>
  );
}