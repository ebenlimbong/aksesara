'use client';

import { useState } from 'react';

export default function ConsoleDashboardPage() {
  const [activeTab, setActiveTab] = useState<'forms' | 'review' | 'keys'>('forms');
  const [fields, setFields] = useState([
    {
      id: 'f1',
      fieldId: 'identity_number',
      officialLabel: 'Nomor Identitas Resmi (NIK / NIM / ID)',
      simpleLabel: 'Berapa nomor identitas Anda?',
      helpText: 'Masukkan nomor identifikasi resmi Anda.',
      status: 'verified',
    },
    {
      id: 'f2',
      fieldId: 'full_name',
      officialLabel: 'Nama Lengkap Sesuai Kartu Identitas',
      simpleLabel: 'Berapa nama lengkap Anda?',
      helpText: 'Tulis nama lengkap Anda tanpa gelar.',
      status: 'ai-suggested',
    },
  ]);

  const handleApprove = (id: string) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: 'verified' } : f))
    );
  };

  const handleReject = (id: string) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: 'rejected' } : f))
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Aksesara Developer Console</h1>
          <p className="text-sm text-gray-600">Organisasi: Aksesara Platform (aks_pk_demo)</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('forms')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${
              activeTab === 'forms' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Form Registry
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${
              activeTab === 'review' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            AI Review Console
          </button>
          <button
            onClick={() => setActiveTab('keys')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${
              activeTab === 'keys' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            API Keys
          </button>
        </div>
      </div>

      {activeTab === 'forms' && (
        <div className="bg-white border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-800">Daftar Formulir Terintegrasi</h2>
          <div className="border rounded-lg p-4 flex justify-between items-center">
            <div>
              <div className="font-bold text-gray-900">Formulir Pengajuan Layanan Aksesara</div>
              <div className="text-xs text-gray-500">ID: layanan-formulir-1 — Allowed Origins: http://localhost:3000, https://*</div>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded font-semibold">
              Published v1.0.0
            </span>
          </div>
        </div>
      )}

      {activeTab === 'review' && (
        <div className="bg-white border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-800">Peninjauan Bahasa Sederhana AI (Admin Review)</h2>
          <p className="text-xs text-gray-600">
            Hanya saran AI yang telah disetujui admin yang akan mendapatkan status terverifikasi pada extension.
          </p>

          <div className="space-y-4">
            {fields.map((f) => (
              <div key={f.id} className="border rounded-lg p-4 space-y-3 bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs text-blue-700 font-bold">{f.fieldId}</span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded font-semibold ${
                      f.status === 'verified'
                        ? 'bg-emerald-100 text-emerald-800'
                        : f.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {f.status === 'verified' ? '✓ Terverifikasi' : f.status === 'rejected' ? 'Ditolak' : 'Menunggu Review AI'}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="text-gray-500 font-semibold mb-1">Teks Label Asli Website:</div>
                    <div className="bg-white p-2 rounded border font-mono">{f.officialLabel}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 font-semibold mb-1">Saran Bahasa Sederhana AI:</div>
                    <div className="bg-white p-2 rounded border">{f.simpleLabel}</div>
                  </div>
                </div>

                {f.status !== 'verified' && (
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleApprove(f.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded font-semibold"
                    >
                      Setujui & Publikasikan (Approve)
                    </button>
                    <button
                      onClick={() => handleReject(f.id)}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded font-semibold"
                    >
                      Tolak (Reject)
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'keys' && (
        <div className="bg-white border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-800">Manajemen Kunci API (API Keys)</h2>
          <div className="border rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-sm">Public Project Key</span>
              <span className="bg-gray-100 font-mono text-xs p-1 rounded">aks_pk_demo</span>
            </div>
            <div className="flex justify-between items-center border-t pt-2">
              <span className="font-bold text-sm">Secret API Key</span>
              <span className="font-mono text-xs text-gray-500">aks_sk_demo_••••••••••••••••</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
