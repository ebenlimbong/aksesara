import React, { useEffect, useState } from 'react';
import { FormGraph, FormNode } from '@aksesara/form-schema';

export default function SidePanel() {
  const [formGraph, setFormGraph] = useState<FormGraph | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showOriginalText, setShowOriginalText] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);

  // AI Feature States
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMode, setAiMode] = useState<'explanation' | 'example' | null>(null);
  const [aiResults, setAiResults] = useState<Record<string, { explanation?: string; example?: string }>>({});

  // Accessibility States
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'xlarge'>('large');
  const [highContrast, setHighContrast] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    scanTabForm();

    if (typeof chrome !== 'undefined' && chrome.runtime) {
      const listener = (message: any) => {
        if (message.type === 'FORM_SCANNED' && message.payload) {
          initFormGraph(message.payload);
        }
      };
      chrome.runtime.onMessage.addListener(listener);
      return () => chrome.runtime.onMessage.removeListener(listener);
    }
  }, []);

  const scanTabForm = async () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const activeTab = tabs[0];
        if (!activeTab?.id) return;

        if (chrome.scripting) {
          try {
            await chrome.scripting.executeScript({
              target: { tabId: activeTab.id },
              files: ['content-scripts/content.js'],
            });
          } catch (e) {
            // Ignore if script is already present
          }
        }

        chrome.tabs.sendMessage(activeTab.id, { type: 'SCAN_FORM' }, (res) => {
          if (chrome.runtime.lastError) {
            chrome.tabs.sendMessage(activeTab.id, { type: 'PARSE_FORM' }, (resParse) => {
              const graphData = resParse?.graph || (resParse?.forms ? resParse.forms[0] : null);
              if (graphData) initFormGraph(graphData);
            });
            return;
          }

          const graphData = res?.graph || (res?.forms ? res.forms[0] : null);
          if (graphData) initFormGraph(graphData);
        });
      });
    }
  };

  const initFormGraph = (graph: FormGraph) => {
    setFormGraph(graph);
    setCurrentIndex(0);
    setIsReviewing(false);
    setShowOriginalText(false);
    setAiMode(null);

    const initialAnswers: Record<string, any> = {};
    if (graph.nodes) {
      graph.nodes.forEach((node) => {
        initialAnswers[node.nodeId] = node.currentValue || '';
      });
    }
    setAnswers(initialAnswers);
  };

  const currentNode: FormNode | undefined = formGraph?.nodes?.[currentIndex];

  const callGeminiAi = async (requestedMode: 'explanation' | 'example') => {
    if (!currentNode) return;
    setAiLoading(true);
    setAiMode(requestedMode);

    try {
      const sanitizedPayload = {
        locale: 'id-ID',
        fields: [
          {
            nodeId: currentNode.nodeId,
            officialLabel: currentNode.officialLabel,
            fieldType: currentNode.fieldType,
            instruction: currentNode.helpText || '',
            helpText: currentNode.helpText || '',
            example: currentNode.example || '',
            required: currentNode.required || false,
            sensitivity: currentNode.sensitivity || 'normal',
          },
        ],
      };

      const res = await fetch('http://localhost:4000/api/v1/assist/fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizedPayload),
      });

      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

      const data = await res.json();
      const aiOutput = data.fields?.[0];

      if (aiOutput) {
        setAiResults((prev) => ({
          ...prev,
          [currentNode.nodeId]: {
            ...prev[currentNode.nodeId],
            explanation: aiOutput.helpText || `Isikan data ${currentNode.officialLabel} Anda.`,
            example: aiOutput.exampleFormat || 'Contoh: 3171234567890123',
          },
        }));
      }
    } catch (error) {
      let fallbackExample = 'Contoh: 3171234567890123';
      const labelLower = (currentNode.officialLabel || '').toLowerCase();
      if (labelLower.includes('lahir')) fallbackExample = 'Contoh: Bandung';
      else if (labelLower.includes('email')) fallbackExample = 'Contoh: nama@domain.com';
      else if (labelLower.includes('telepon') || labelLower.includes('hp')) fallbackExample = 'Contoh: 081234567890';

      setAiResults((prev) => ({
        ...prev,
        [currentNode.nodeId]: {
          ...prev[currentNode.nodeId],
          explanation: `Isikan data ${currentNode.officialLabel} sesuai dengan dokumen resmi Anda.`,
          example: fallbackExample,
        },
      }));
    } finally {
      setAiLoading(false);
    }
  };

  const handleValueChange = (val: any) => {
    if (!currentNode) return;
    setAnswers((prev) => ({ ...prev, [currentNode.nodeId]: val }));

    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'SYNC_FIELD_VALUE',
            payload: {
              selector: currentNode.source.selector,
              value: val,
            },
          });
        }
      });
    }
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      utterance.rate = 0.85;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeak = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleNext = () => {
    if (!formGraph || !formGraph.nodes) return;
    if (currentIndex < formGraph.nodes.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowOriginalText(false);
      setAiMode(null);
    } else {
      setIsReviewing(true);
    }
  };

  const handleBack = () => {
    if (isReviewing) {
      setIsReviewing(false);
    } else if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setShowOriginalText(false);
      setAiMode(null);
    }
  };

  // Dynamic Typography Styles
  const fontTitleClass = textSize === 'xlarge' ? 'text-2xl' : textSize === 'large' ? 'text-xl' : 'text-lg';
  const fontBodyClass = textSize === 'xlarge' ? 'text-base' : textSize === 'large' ? 'text-sm' : 'text-xs';

  // 🎨 PALET WARNA BARU: DARK MODE ELEGAN & SOFT UNTUK MATA
  const theme = {
    bgContainer: highContrast ? 'bg-[#101216] text-[#e2e8f0]' : 'bg-[#f7f8fa] text-[#1c1e21]',
    headerTitle: highContrast ? 'text-white font-bold' : 'text-slate-900 font-bold',
    badge: highContrast
      ? 'bg-[#1e232d] text-[#60a5fa] border border-[#2b3548]'
      : 'bg-[#fef3c7] text-[#92400e] border border-[#fde68a]',
    card: highContrast
      ? 'bg-[#181a20] border border-[#2e333d] text-white shadow-xl'
      : 'bg-white border border-slate-200 text-slate-900 shadow-sm',
    cardTitle: highContrast ? 'text-white' : 'text-slate-900',
    cardSubtext: highContrast ? 'text-[#94a3b8]' : 'text-slate-600',
    btnSecondary: highContrast
      ? 'bg-[#1e222a] hover:bg-[#282d38] text-slate-200 border border-[#333a48]'
      : 'bg-[#eef0f3] hover:bg-[#e2e5ea] text-slate-800 border border-slate-200',
    btnPrimary: highContrast
      ? 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold border border-[#3b82f6]'
      : 'bg-[#003399] hover:bg-[#002673] text-white',
    btnDisabled: highContrast
      ? 'bg-[#16181d] text-[#475569] border border-[#212631] cursor-not-allowed'
      : 'opacity-40 bg-[#eef0f3] text-slate-400 border-slate-200 cursor-not-allowed',
    input: highContrast
      ? 'bg-[#0d0e11] text-white border-2 border-[#3b82f6] placeholder-[#64748b] focus:outline-none'
      : 'bg-white text-slate-900 border-2 border-slate-400 placeholder-slate-400 focus:outline-none focus:border-[#003399]',
    aiBtn: highContrast
      ? 'bg-[#222732] hover:bg-[#2c3342] text-slate-200 border border-[#384256]'
      : 'bg-[#f4f5f7] border border-slate-200 text-slate-700 hover:bg-[#e8eaee]',
    progressBar: highContrast ? 'bg-[#3b82f6]' : 'bg-[#003399]',
    progressTrack: highContrast ? 'bg-[#262c36]' : 'bg-slate-200',
    speakerBtn: highContrast
      ? 'bg-[#1e293b] text-[#60a5fa] hover:bg-[#2c3e5a] border border-[#3b82f6]/40'
      : 'bg-[#e8efff] text-[#003399] hover:bg-[#d0e0ff]',
  };

  if (!formGraph || !formGraph.nodes || formGraph.nodes.length === 0) {
    return (
      <div className={`${theme.bgContainer} min-h-screen p-4 flex flex-col items-center justify-center space-y-6 text-center font-serif`}>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-md ${highContrast ? 'bg-[#2563eb] text-white' : 'bg-[#003399] text-white'}`}>
          A
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold font-serif">Formulir Belum Ditemukan</h2>
          <p className="text-sm font-sans max-w-xs opacity-90">
            Buka halaman web yang berisi formulir, lalu tekan tombol pindai ulang di bawah ini.
          </p>
        </div>
        <button
          onClick={scanTabForm}
          className={`w-full font-serif font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 ${theme.btnSecondary}`}
        >
          <span className="text-lg">🔄</span>
          <span>Pindai Ulang Form</span>
        </button>
      </div>
    );
  }

  const activeAi = currentNode ? aiResults[currentNode.nodeId] : undefined;
  const progressPercent = Math.round(((currentIndex + 1) / formGraph.nodes.length) * 100);

  return (
    <div className={`${theme.bgContainer} min-h-screen p-4 flex flex-col justify-between font-serif transition-colors duration-200`}>
      {/* 🟢 HEADER */}
      <header className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-serif font-bold text-lg shadow-sm ${highContrast ? 'bg-[#2563eb] text-white' : 'bg-[#003399] text-white'}`}>
              A
            </div>
            <div className="flex items-center space-x-2">
              <span className={`font-serif text-base tracking-tight ${theme.headerTitle}`}>Aksesara</span>
              <span className={`text-[11px] font-sans font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${theme.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${highContrast ? 'bg-[#60a5fa]' : 'bg-[#d97706]'}`}></span> Mode Terverifikasi
              </span>
            </div>
          </div>

          <button
            onClick={() => window.close && window.close()}
            className={`p-1 text-lg font-bold ${highContrast ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}
            aria-label="Tutup Panel"
          >
            ✕
          </button>
        </div>

        {/* Tombol Pindai Ulang Form */}
        <button
          onClick={scanTabForm}
          className={`w-full font-serif font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-sm transition-all ${theme.btnSecondary}`}
        >
          <span className="text-base">🔄</span>
          <span>Pindai Ulang Form</span>
        </button>

        {/* 🛠️ TOOLBAR AKSESIBILITAS */}
        <div className={`p-1.5 rounded-2xl flex items-center justify-between border ${highContrast ? 'bg-[#181a20] border-[#2e333d]' : 'bg-[#f0f2f5] border-slate-200'}`}>
          <div className={`p-0.5 rounded-xl flex items-center space-x-1 ${highContrast ? 'bg-[#0f1115]' : 'bg-[#e4e7eb]'}`}>
            <button
              onClick={() => setTextSize('normal')}
              className={`px-3 py-1 text-xs font-serif rounded-lg transition-all ${
                textSize === 'normal'
                  ? highContrast ? 'bg-[#2563eb] text-white font-extrabold' : 'bg-white text-slate-900 shadow-sm font-bold'
                  : highContrast ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              A
            </button>
            <button
              onClick={() => setTextSize('large')}
              className={`px-3 py-1 text-sm font-serif transition-all rounded-lg ${
                textSize === 'large'
                  ? highContrast ? 'bg-[#2563eb] text-white font-extrabold' : 'bg-white text-[#003399] shadow-sm font-bold'
                  : highContrast ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              A+
            </button>
            <button
              onClick={() => setTextSize('xlarge')}
              className={`px-3 py-1 text-base font-serif transition-all rounded-lg ${
                textSize === 'xlarge'
                  ? highContrast ? 'bg-[#2563eb] text-white font-extrabold' : 'bg-white text-[#003399] shadow-sm font-bold'
                  : highContrast ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              A++
            </button>
          </div>

          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shadow-sm transition-all border ${
              highContrast
                ? 'bg-[#2563eb] text-white border-[#3b82f6] font-bold'
                : 'bg-[#2d3139] hover:bg-black text-white border-transparent'
            }`}
            title="Toggle Mode Kontras Tinggi"
            aria-label="Ubah Kontras Tampilan"
          >
            ◑
          </button>
        </div>
      </header>

      {/* 🟡 AREA UTAMA (PROGRESS & CARD) */}
      <main className="my-4 flex-1 space-y-3">
        {!isReviewing && currentNode ? (
          <>
            {/* INDIKATOR PROGRESS STEP */}
            <div className="space-y-1.5 pt-1">
              <div className={`flex justify-between items-center text-xs font-serif tracking-wider uppercase font-bold ${theme.cardSubtext}`}>
                <span>LANGKAH {currentIndex + 1} DARI {formGraph.nodes.length}</span>
                <span className="font-sans font-bold">{progressPercent}%</span>
              </div>
              <div className={`w-full ${theme.progressTrack} h-2 rounded-full overflow-hidden`}>
                <div
                  className={`h-2 ${theme.progressBar} transition-all duration-300 rounded-full`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* KOTAK KONTEN PERTANYAAN */}
            <div className={`rounded-2xl p-4 space-y-4 ${theme.card}`}>
              <div className="flex justify-between items-start gap-3">
                <h2 className={`${fontTitleClass} font-serif font-bold leading-snug ${theme.cardTitle}`}>
                  {currentNode.simpleLabel || currentNode.officialLabel}
                  {currentNode.required && <span className="text-red-400 ml-1">*</span>}
                </h2>

                {/* Tombol Audio Bantuan */}
                <button
                  onClick={() =>
                    isSpeaking
                      ? stopSpeak()
                      : handleSpeak(currentNode.simpleLabel || currentNode.officialLabel)
                  }
                  className={`p-2.5 rounded-2xl shrink-0 transition-all ${
                    isSpeaking
                      ? 'bg-red-500 text-white animate-pulse'
                      : theme.speakerBtn
                  }`}
                  aria-label="Bacakan Teks Pertanyaan Ini"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                </button>
              </div>

              {/* TOMBOL BANTUAN AI */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => callGeminiAi('explanation')}
                  disabled={aiLoading}
                  className={`px-3 py-1.5 rounded-lg text-xs font-serif font-semibold flex items-center gap-1.5 transition-all ${theme.aiBtn}`}
                >
                  <span>💡</span>
                  <span>{aiLoading && aiMode === 'explanation' ? 'Memuat...' : 'Jelaskan (AI)'}</span>
                </button>

                <button
                  onClick={() => callGeminiAi('example')}
                  disabled={aiLoading}
                  className={`px-3 py-1.5 rounded-lg text-xs font-serif font-semibold flex items-center gap-1.5 transition-all ${theme.aiBtn}`}
                >
                  <span>📝</span>
                  <span>{aiLoading && aiMode === 'example' ? 'Memuat...' : 'Contoh (AI)'}</span>
                </button>
              </div>

              {/* HASIL KELUARAN AI */}
              {aiMode === 'explanation' && activeAi?.explanation && (
                <div className={`p-3 rounded-xl text-xs font-sans space-y-1 ${highContrast ? 'bg-[#101319] border border-[#2b3548] text-slate-300' : 'bg-[#f8fafc] border border-slate-200 text-slate-700'}`}>
                  <strong className="font-bold text-[#60a5fa]">💡 Penjelasan:</strong>
                  <p className={fontBodyClass}>{activeAi.explanation}</p>
                </div>
              )}

              {aiMode === 'example' && activeAi?.example && (
                <div className={`p-3 rounded-xl text-xs font-sans space-y-1 ${highContrast ? 'bg-[#101319] border border-[#2b3548] text-slate-300' : 'bg-[#f8fafc] border border-slate-200 text-slate-700'}`}>
                  <strong className="font-bold text-[#60a5fa]">📝 Contoh Format:</strong>
                  <p className={`${fontBodyClass} font-mono p-2 rounded ${highContrast ? 'bg-[#0d0e11] text-white border border-[#2e333d]' : 'bg-white text-slate-900 border border-slate-200'}`}>
                    {activeAi.example}
                  </p>
                </div>
              )}

              {/* INPUT FORM */}
              <div className="space-y-2 pt-1">
                <div className={`inline-block text-xs font-serif font-medium px-2.5 py-1 rounded-md ${highContrast ? 'bg-[#222732] text-slate-300 border border-[#333e52]' : 'bg-[#f0f2f5] text-slate-600'}`}>
                  Ketik jawaban Anda di sini:
                </div>

                {currentNode.fieldType === 'textarea' ? (
                  <textarea
                    rows={3}
                    value={answers[currentNode.nodeId] || ''}
                    onChange={(e) => handleValueChange(e.target.value)}
                    className={`w-full p-3 rounded-xl font-sans ${theme.input}`}
                    placeholder="Contoh: Jl. Merdeka No. 45"
                  />
                ) : currentNode.fieldType === 'select' ? (
                  <select
                    value={answers[currentNode.nodeId] || ''}
                    onChange={(e) => handleValueChange(e.target.value)}
                    className={`w-full p-3 rounded-xl font-sans ${theme.input}`}
                  >
                    <option value="" className={highContrast ? 'bg-[#181a20] text-white' : 'bg-white text-slate-900'}>-- Pilih Jawaban --</option>
                    {currentNode.options?.map((opt, i) => (
                      <option key={i} value={opt.value} className={highContrast ? 'bg-[#181a20] text-white' : 'bg-white text-slate-900'}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={currentNode.fieldType === 'number' ? 'number' : 'text'}
                    value={answers[currentNode.nodeId] || ''}
                    onChange={(e) => handleValueChange(e.target.value)}
                    className={`w-full p-3.5 rounded-xl font-sans ${theme.input}`}
                    placeholder="Contoh: 3171234567890123"
                  />
                )}
              </div>

              {/* FOOTER HELPER CARD */}
              <div className={`flex items-center justify-between text-xs font-sans pt-1 ${theme.cardSubtext}`}>
                <div className="flex items-center gap-1">
                  <span>⋮⋮</span>
                  <span>{currentNode.fieldType === 'number' ? 'Harus berisi angka' : 'Isikan data sesuai dokumen'}</span>
                </div>

                <button
                  onClick={() => setShowOriginalText(!showOriginalText)}
                  className={`font-serif font-semibold hover:underline ${highContrast ? 'text-[#60a5fa]' : 'text-[#003399]'}`}
                >
                  {showOriginalText ? 'Sembunyikan' : 'Lihat Label Asli'}
                </button>
              </div>

              {showOriginalText && (
                <div className={`p-2.5 rounded-lg font-mono text-xs ${highContrast ? 'bg-[#101216] text-slate-300 border border-[#2b3548]' : 'bg-slate-50 text-slate-700 border border-slate-200'}`}>
                  {currentNode.officialLabel}
                </div>
              )}
            </div>
          </>
        ) : (
          /* RINGKASAN JAWABAN (REVIEW STEP) */
          <div className={`rounded-2xl p-4 space-y-3 ${theme.card}`}>
            <h2 className="text-xl font-serif font-bold">Ringkasan Jawaban</h2>
            <p className="text-xs font-sans opacity-80">Periksa kembali sebelum dikirimkan ke web asli:</p>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {formGraph.nodes.map((node, i) => {
                const val = answers[node.nodeId];
                return (
                  <div key={node.nodeId} className={`p-3 rounded-xl border flex justify-between items-center text-xs ${highContrast ? 'bg-[#101216] border-[#2b3548] text-white' : 'bg-[#f8fafc] border-slate-200 text-slate-900'}`}>
                    <div>
                      <div className="font-serif font-semibold opacity-80">{node.simpleLabel || node.officialLabel}</div>
                      <div className="font-sans font-bold mt-0.5">
                        {val || <span className="text-red-400 italic">Belum Diisi</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIsReviewing(false);
                        setCurrentIndex(i);
                      }}
                      className={`font-serif font-bold hover:underline ${highContrast ? 'text-[#60a5fa]' : 'text-[#003399]'}`}
                    >
                      Ubah
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* 🔴 FOOTER TOMBOL NAVIGASI UTAMA */}
      <footer className="pt-2">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleBack}
            disabled={currentIndex === 0 && !isReviewing}
            className={`py-3.5 px-4 rounded-2xl font-serif font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              currentIndex === 0 && !isReviewing ? theme.btnDisabled : theme.btnSecondary
            }`}
          >
            <span>←</span>
            <span>Kembali</span>
          </button>

          {!isReviewing ? (
            <button
              onClick={handleNext}
              className={`py-3.5 px-4 rounded-2xl font-serif font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all ${theme.btnPrimary}`}
            >
              <span>{currentIndex === formGraph.nodes.length - 1 ? 'Tinjau' : 'Lanjut'}</span>
              <span>→</span>
            </button>
          ) : (
            <button
              onClick={() => {
                if (typeof chrome !== 'undefined' && chrome.tabs) {
                  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    if (tabs[0]?.id) {
                      chrome.tabs.sendMessage(tabs[0].id, {
                        type: 'SUBMIT_TARGET_FORM',
                        payload: { formId: formGraph.formId },
                      });
                    }
                  });
                }
              }}
              className={`col-span-2 py-3.5 px-4 rounded-2xl font-serif font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${theme.btnPrimary}`}
            >
              <span>Kirim Formulir di Web Asli</span>
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}