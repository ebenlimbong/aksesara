import React, { useEffect, useState } from 'react';

// 🎨 Logo ekstensi (sama dengan icon di manifest / toolbar browser)
const LOGO_URL =
  typeof chrome !== 'undefined' && chrome.runtime?.getURL
    ? chrome.runtime.getURL('Icon.png')
    : '/Icon.png';

export default function Popup() {
  const [activeUrl, setActiveUrl] = useState<string>('');
  const [fieldCount, setFieldCount] = useState<number | null>(null);
  const [mode, setMode] = useState<'universal' | 'verified'>('universal');
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.url) {
          try {
            const urlObj = new URL(tabs[0].url);
            setActiveUrl(urlObj.origin);
          } catch (e) {
            setActiveUrl(tabs[0].url);
          }

          // Trigger initial scan
          if (tabs[0].id) {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'SCAN_FORM' }, (res) => {
              if (res?.graph) {
                setFieldCount(res.graph.nodes.length);
                setMode(res.graph.mode || 'universal');
              }
            });
          }
        }
      });
    }
  }, []);

  const handleScanClick = () => {
    setScanning(true);
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'SCAN_FORM' }, (res) => {
            setScanning(false);
            if (res?.graph) {
              setFieldCount(res.graph.nodes.length);
              setMode(res.graph.mode || 'universal');
            }
          });
        }
      });
    }
  };

  const handleOpenSidePanel = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.windowId && chrome.sidePanel) {
          chrome.sidePanel.open({ windowId: tabs[0].windowId });
        }
      });
    }
  };

  return (
    <div className="w-80 bg-white p-4 font-sans border border-gray-200 text-gray-800 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 overflow-hidden rounded-lg bg-white flex items-center justify-center">
            <img src={LOGO_URL} alt="Logo Aksesara" className="w-7 h-7 object-contain" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight">Aksesara</h1>
            <p className="text-[10px] text-gray-500">Pendamping Formulir Web</p>
          </div>
        </div>

        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
            mode === 'verified'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {mode === 'verified' ? '✓ Terverifikasi' : 'Mode Universal'}
        </span>
      </div>

      {/* Tab info */}
      <div className="bg-gray-50 p-2.5 rounded border text-xs space-y-1">
        <div className="text-gray-500 text-[10px]">Domain Tab Aktif:</div>
        <div className="font-semibold text-gray-800 truncate">{activeUrl || 'Memuat tab...'}</div>
      </div>

      {/* Field detection state */}
      <div className="flex items-center justify-between text-xs bg-blue-50 p-2.5 rounded border border-blue-100">
        <div>
          <span className="text-gray-600">Field Terdeteksi:</span>{' '}
          <strong className="text-blue-700 text-sm">
            {fieldCount !== null ? `${fieldCount} field` : 'Belum dipindai'}
          </strong>
        </div>
        <button
          onClick={handleScanClick}
          disabled={scanning}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2.5 py-1 rounded font-medium disabled:opacity-50"
        >
          {scanning ? 'Memindai...' : 'Pindai Ulang'}
        </button>
      </div>

      {/* Main CTA */}
      <button
        onClick={handleOpenSidePanel}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2.5 px-4 rounded-lg shadow flex items-center justify-center gap-2 transition"
      >
        <span>Buka Side Panel Aksesara</span>
        <span>&rarr;</span>
      </button>

      {/* Privacy Notice Summary */}
      <div className="border-t pt-3 text-[11px] text-gray-500 space-y-1">
        <div className="font-semibold text-gray-700">Jaminan Privasi Aksesara:</div>
        <ul className="list-disc pl-4 space-y-0.5 text-[10px]">
          <li>Hanya mengakses tab aktif saat diminta.</li>
          <li>Jawaban & isi formulir tidak pernah dikirim ke AI.</li>
          <li>Tidak mengambil cookie, token, atau password.</li>
        </ul>
      </div>
    </div>
  );
}
