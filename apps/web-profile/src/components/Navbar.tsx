"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, ShieldCheck, Download } from 'lucide-react';

export const Navbar = () => {
  const [highContrast, setHighContrast] = useState(false);

  const toggleContrast = () => {
    setHighContrast(!highContrast);
    document.body.classList.toggle('high-contrast');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between" aria-label="Navigasi Utama">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary-700 tracking-tight">Aksesara</span>
          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-semibold">
            Gemastik XIX
          </span>
        </div>

        <div className="hidden md:flex items-center gap-6 font-medium text-slate-600">
          <a href="#tentang" className="hover:text-primary-600 focus:outline-2 focus:outline-primary-500">Tentang</a>
          <a href="#fitur" className="hover:text-primary-600 focus:outline-2 focus:outline-primary-500">Fitur Utama</a>
          <a href="#arsitektur" className="hover:text-primary-600 focus:outline-2 focus:outline-primary-500">Arsitektur</a>
          <a href="#tim" className="hover:text-primary-600 focus:outline-2 focus:outline-primary-500">Tim Kami</a>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleContrast}
            className="p-2 rounded-lg border border-slate-300 hover:bg-slate-100 focus:ring-2 focus:ring-primary-500"
            aria-label="Mode Kontras Tinggi"
            title="Toggle High Contrast"
          >
            <Eye className="w-5 h-5 text-slate-700" />
          </button>
          <a
            href="#install"
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            <Download className="w-4 h-4" /> Pasang Ekstensi
          </a>
        </div>
      </nav>
    </header>
  );
};