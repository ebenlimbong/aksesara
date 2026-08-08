import React from 'react';
import { ShieldCheck, Sparkles, Layers } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-primary-50 to-white text-slate-800">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-semibold mb-6">
            <ShieldCheck className="w-4 h-4" /> Verified & Universal Mode
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-6">
            Pendamping Pengisian Formulir Web secara <span className="text-primary-600">Inklusif & Adaptif</span>
          </h1>
          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            Aksesara membantu pengguna berinteraksi dengan formulir digital tanpa memindahkan alur autentikasi dan validasi dari website asal melalui antarmuka pendamping Side Panel.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="#demo" className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 shadow-md transition">
              Coba Simulasi Demo
            </a>
            <a href="#dokumentasi" className="border border-slate-300 bg-white text-slate-700 px-6 py-3 rounded-lg font-semibold hover:bg-slate-50 transition">
              Baca Proposal
            </a>
          </div>
        </div>

        {/* Visualisasi Antarmuka Ekstensi */}
        <div className="relative border-4 border-slate-800 rounded-2xl shadow-2xl bg-slate-900 overflow-hidden">
          <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-700">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs text-slate-400 ml-2">simulasi.kampus.ac.id/pendaftaran</span>
          </div>
          <div className="p-4 grid grid-cols-3 gap-3 bg-slate-900 text-white min-h-[280px]">
            <div className="col-span-2 p-3 bg-slate-800 rounded border border-slate-700 opacity-60">
              <p className="text-xs mb-2">Formulir Asli Kampus (DOM)</p>
              <div className="h-4 bg-slate-700 rounded mb-2 w-3/4"></div>
              <div className="h-8 bg-slate-700 rounded mb-3"></div>
              <div className="h-4 bg-slate-700 rounded mb-2 w-1/2"></div>
              <div className="h-8 bg-slate-700 rounded"></div>
            </div>
            {/* Aksesara Side Panel Simulation */}
            <div className="col-span-1 p-3 bg-primary-900/90 rounded border-2 border-primary-500 flex flex-col justify-between">
              <div>
                <span className="text-[10px] bg-primary-500 text-white px-1.5 py-0.5 rounded font-bold uppercase">Side Panel</span>
                <p className="text-xs font-bold mt-2 text-primary-100">Pertanyaan 1/5</p>
                <p className="text-[11px] text-slate-200 mt-1">Berapa total penghasilan orang tua?</p>
              </div>
              <button className="w-full bg-primary-500 text-[10px] py-1 rounded font-bold">Sinkronkan</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};