"use client";

import React, { useState } from "react";
import {
  Eye,
  ShieldCheck,
  Download,
  Globe,
  CheckCircle2,
  Cpu,
  Volume2,
  FileCheck2,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  const [highContrast, setHighContrast] = useState(false);

  const toggleContrast = () => {
    setHighContrast(!highContrast);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        highContrast
          ? "bg-black text-yellow-300 [&_*]:border-yellow-400"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* 1. NAVBAR */}
      <header
        className={`sticky top-0 z-50 border-b backdrop-blur-md ${
          highContrast
            ? "bg-black border-yellow-400"
            : "bg-white/80 border-slate-200"
        }`}
      >
        <nav
          className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between"
          aria-label="Navigasi Utama"
        >
          <div className="flex items-center gap-3">
            <span
              className={`text-2xl font-black tracking-tight ${
                highContrast ? "text-yellow-300" : "text-primary-700"
              }`}
            >
              Aksesara
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                highContrast
                  ? "bg-yellow-400 text-black"
                  : "bg-primary-100 text-primary-700"
              }`}
            >
              Gemastik XIX
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 font-medium text-sm">
            <a
              href="#tentang"
              className="hover:underline focus:outline-2 focus:outline-primary-500"
            >
              Tentang
            </a>
            <a
              href="#mode"
              className="hover:underline focus:outline-2 focus:outline-primary-500"
            >
              Dua Mode
            </a>
            <a
              href="#fitur"
              className="hover:underline focus:outline-2 focus:outline-primary-500"
            >
              Fitur Utama
            </a>
            <a
              href="#tim"
              className="hover:underline focus:outline-2 focus:outline-primary-500"
            >
              Tim Kami
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleContrast}
              className={`p-2 rounded-lg border font-medium text-xs flex items-center gap-2 transition ${
                highContrast
                  ? "bg-yellow-400 text-black border-yellow-300 font-bold"
                  : "bg-white border-slate-300 hover:bg-slate-100 text-slate-700"
              }`}
              aria-label="Mode Kontras Tinggi"
              title="Toggle High Contrast Mode"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">
                {highContrast ? "Mode Normal" : "Kontras Tinggi"}
              </span>
            </button>
            <a
              href="#install"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                highContrast
                  ? "bg-yellow-300 text-black hover:bg-yellow-400"
                  : "bg-primary-600 text-white hover:bg-primary-700 shadow-sm"
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Pasang Ekstensi</span>
            </a>
          </div>
        </nav>
      </header>

      {/* 2. HERO SECTION */}
      <section className="py-20 px-6 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold mb-6 border ${
              highContrast
                ? "bg-yellow-400 text-black border-yellow-300"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Verified & Universal Accessibility Engine
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight mb-6">
            Pendamping Pengisian Formulir Web secara{" "}
            <span
              className={highContrast ? "underline" : "text-primary-600"}
            >
              Inklusif & Adaptif
            </span>
          </h1>
          <p
            className={`text-base sm:text-lg mb-8 leading-relaxed ${
              highContrast ? "text-yellow-200" : "text-slate-600"
            }`}
          >
            Aksesara membantu disabilitas dan seluruh pengguna berinteraksi dengan
            formulir digital tanpa memindahkan alur autentikasi maupun sistem validasi
            dari website asal melalui antarmuka pendamping <strong>Side Panel</strong>.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="#demo"
              className={`px-6 py-3 rounded-lg font-bold text-sm transition flex items-center gap-2 ${
                highContrast
                  ? "bg-yellow-300 text-black hover:bg-yellow-400"
                  : "bg-primary-600 text-white hover:bg-primary-700 shadow-md"
              }`}
            >
              Coba Simulasi Demo <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#proposal"
              className={`px-6 py-3 rounded-lg font-bold text-sm border transition ${
                highContrast
                  ? "border-yellow-400 text-yellow-300 hover:bg-yellow-400 hover:text-black"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              Baca Proposal
            </a>
          </div>
        </div>

        {/* Mockup Antarmuka Ekstensi */}
        <div
          className={`border-2 rounded-2xl overflow-hidden shadow-2xl ${
            highContrast
              ? "border-yellow-400 bg-black"
              : "border-slate-800 bg-slate-900 text-white"
          }`}
        >
          <div
            className={`px-4 py-3 border-b flex items-center gap-2 ${
              highContrast
                ? "border-yellow-400 bg-black"
                : "border-slate-800 bg-slate-800/80"
            }`}
          >
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-xs font-mono ml-2 opacity-70">
              https://pendaftaran.kampus.ac.id/form
            </span>
          </div>
          <div className="p-4 grid grid-cols-3 gap-3 min-h-[300px]">
            {/* Halaman Web Asli */}
            <div
              className={`col-span-2 p-4 rounded-lg border flex flex-col justify-between ${
                highContrast
                  ? "border-yellow-400 bg-black"
                  : "border-slate-800 bg-slate-950/50"
              }`}
            >
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Situs Web Asli (DOM)
                </p>
                <div className="h-3 bg-slate-700 rounded w-3/4 mb-3"></div>
                <div className="h-9 bg-slate-800 border border-slate-700 rounded mb-4"></div>
                <div className="h-3 bg-slate-700 rounded w-1/2 mb-3"></div>
                <div className="h-9 bg-slate-800 border border-slate-700 rounded"></div>
              </div>
              <span className="text-[10px] text-slate-500 italic">
                Aksesara menyinkronkan data secara otomatis ke formulir ini.
              </span>
            </div>

            {/* Side Panel Aksesara */}
            <div
              className={`col-span-1 p-3.5 rounded-lg border flex flex-col justify-between ${
                highContrast
                  ? "border-yellow-300 bg-yellow-400 text-black"
                  : "border-primary-500 bg-primary-950 text-white"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                      highContrast
                        ? "bg-black text-yellow-300"
                        : "bg-primary-500 text-white"
                    }`}
                  >
                    Side Panel
                  </span>
                  <Volume2 className="w-3.5 h-3.5 opacity-80" />
                </div>
                <p className="text-xs font-bold mb-1">Pertanyaan 1 dari 4</p>
                <p className="text-[11px] leading-snug opacity-90 mb-3">
                  Masukkan total penghasilan kotor orang tua per bulan:
                </p>
                <div
                  className={`h-7 rounded border px-2 text-[10px] flex items-center ${
                    highContrast
                      ? "bg-black text-yellow-300 border-black"
                      : "bg-slate-900 border-primary-700 text-slate-300"
                  }`}
                >
                  Rp 5.000.000
                </div>
              </div>
              <button
                className={`w-full py-1.5 rounded text-[10px] font-bold text-center ${
                  highContrast
                    ? "bg-black text-yellow-300"
                    : "bg-primary-500 text-white hover:bg-primary-600"
                }`}
              >
                Isi Otomatis
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DUA MODE PENGGUNAAN */}
      <section
        id="mode"
        className={`py-20 border-y ${
          highContrast
            ? "bg-black border-yellow-400"
            : "bg-white border-slate-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-black mb-4">Dua Mode Pendekatan</h2>
            <p
              className={highContrast ? "text-yellow-200" : "text-slate-600"}
            >
              Dirancang fleksibel: dapat bekerja secara independen di situs mana pun, atau terintegrasi langsung dengan platform mitra.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Mode Universal */}
            <div
              className={`p-8 rounded-2xl border ${
                highContrast
                  ? "border-yellow-400 bg-black"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${
                  highContrast
                    ? "bg-yellow-400 text-black"
                    : "bg-primary-100 text-primary-600"
                }`}
              >
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">1. Mode Universal</h3>
              <p
                className={`text-sm leading-relaxed ${
                  highContrast ? "text-yellow-200" : "text-slate-600"
                }`}
              >
                Mendukung <strong>seluruh website</strong> di internet. Ekstensi Aksesara melakukan ekstraksi DOM secara otomatis, memetakan elemen formulir yang acak, dan menyajikannya ulang dalam antarmuka Side Panel yang terstruktur serta rapi.
              </p>
            </div>

            {/* Mode Terverifikasi */}
            <div
              className={`p-8 rounded-2xl border ${
                highContrast
                  ? "border-yellow-400 bg-black"
                  : "border-emerald-300 bg-emerald-50/50"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${
                  highContrast
                    ? "bg-yellow-400 text-black"
                    : "bg-emerald-100 text-emerald-600"
                }`}
              >
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">2. Mode Terverifikasi</h3>
              <p
                className={`text-sm leading-relaxed ${
                  highContrast ? "text-yellow-200" : "text-slate-600"
                }`}
              >
                Untuk website mitra yang memasang <strong>Aksesara Bridge SDK</strong>. Metadata formulir diverifikasi langsung oleh instansi terkait untuk menjamin kepastian pemetaan data, mendukung instruksi bahasa isyarat, dan validasi 100% presisi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FITUR UNGGULAN */}
      <section id="fitur" className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-black text-center mb-12">Fitur Utama</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            className={`p-6 rounded-xl border ${
              highContrast
                ? "border-yellow-400 bg-black"
                : "border-slate-200 bg-white"
            }`}
          >
            <Cpu className="w-8 h-8 mb-4 text-primary-600" />
            <h4 className="font-bold text-lg mb-2">AI Sanitizer & Parser</h4>
            <p className="text-xs leading-relaxed opacity-80">
              Menyederhanakan instruksi dan pertanyaan hukum atau birokrasi yang rumit menjadi bahasa yang gampang dipahami.
            </p>
          </div>

          <div
            className={`p-6 rounded-xl border ${
              highContrast
                ? "border-yellow-400 bg-black"
                : "border-slate-200 bg-white"
            }`}
          >
            <Volume2 className="w-8 h-8 mb-4 text-primary-600" />
            <h4 className="font-bold text-lg mb-2">Multi-Modal Interaction</h4>
            <p className="text-xs leading-relaxed opacity-80">
              Mendukung masukan suara (Voice-to-Text), Text-to-Speech yang ramah *screen reader*, dan ukuran font yang dapat disesuaikan.
            </p>
          </div>

          <div
            className={`p-6 rounded-xl border ${
              highContrast
                ? "border-yellow-400 bg-black"
                : "border-slate-200 bg-white"
            }`}
          >
            <FileCheck2 className="w-8 h-8 mb-4 text-primary-600" />
            <h4 className="font-bold text-lg mb-2">Zero-Data Migration</h4>
            <p className="text-xs leading-relaxed opacity-80">
              Tidak ada data pribadi yang disimpan di server eksternal. Semua proses autentikasi tetap berjalan langsung di situs web target.
            </p>
          </div>
        </div>
      </section>

      {/* 5. TIM PENGEMBANG */}
      <section
        id="tim"
        className={`py-20 border-t ${
          highContrast
            ? "bg-black border-yellow-400"
            : "bg-white border-slate-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black mb-2">Tim Pengembang</h2>
          <p
            className={`text-sm mb-12 ${
              highContrast ? "text-yellow-200" : "text-slate-600"
            }`}
          >
            Gemastik XIX — Institut Teknologi Sumatera (ITERA)
          </p>

          <div className="grid sm:grid-cols-3 gap-8">
            <div
              className={`p-6 rounded-xl border ${
                highContrast
                  ? "border-yellow-400 bg-black"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="w-20 h-20 bg-slate-300 rounded-full mx-auto mb-4 border-2 border-primary-500 flex items-center justify-center font-black text-slate-700">
                KT
              </div>
              <h3 className="font-bold text-lg">[Nama Ketua]</h3>
              <p className="text-xs text-primary-600 font-semibold mt-1">
                Ketua Tim / Lead Developer
              </p>
              <p className="text-[11px] opacity-70 mt-1">NIM: 121140xxx</p>
            </div>

            <div
              className={`p-6 rounded-xl border ${
                highContrast
                  ? "border-yellow-400 bg-black"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="w-20 h-20 bg-slate-300 rounded-full mx-auto mb-4 border-2 border-primary-500 flex items-center justify-center font-black text-slate-700">
                A1
              </div>
              <h3 className="font-bold text-lg">[Nama Anggota 1]</h3>
              <p className="text-xs text-primary-600 font-semibold mt-1">
                Anggota / UI/UX & Accessible Engineer
              </p>
              <p className="text-[11px] opacity-70 mt-1">NIM: 121140xxx</p>
            </div>

            <div
              className={`p-6 rounded-xl border ${
                highContrast
                  ? "border-yellow-400 bg-black"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="w-20 h-20 bg-slate-300 rounded-full mx-auto mb-4 border-2 border-primary-500 flex items-center justify-center font-black text-slate-700">
                A2
              </div>
              <h3 className="font-bold text-lg">[Nama Anggota 2]</h3>
              <p className="text-xs text-primary-600 font-semibold mt-1">
                Anggota / Fullstack & AI Specialist
              </p>
              <p className="text-[11px] opacity-70 mt-1">NIM: 121140xxx</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer
        className={`py-8 text-center text-xs border-t ${
          highContrast
            ? "border-yellow-400 text-yellow-300 bg-black"
            : "border-slate-200 text-slate-500 bg-slate-50"
        }`}
      >
        <p>
          &copy; {new Date().getFullYear()} Aksesara — Tim Gemastik Institut Teknologi Sumatera.
        </p>
      </footer>
    </div>
  );
}