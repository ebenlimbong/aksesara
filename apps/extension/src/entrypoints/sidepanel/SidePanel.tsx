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
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'xlarge'>('large'); // Default dibuat Large
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
            example: aiOutput.exampleFormat || 'Contoh: Bandung, Jakarta, Medan',
          },
        }));
      }
    } catch (error) {
      let fallbackExample = 'Isikan data sesuai dokumen resmi Anda.';
      const labelLower = (currentNode.officialLabel || '').toLowerCase();
      if (labelLower.includes('lahir')) fallbackExample = 'Bandung, Jakarta, Medan, Lampung';
      else if (labelLower.includes('kecamatan') || labelLower.includes('wil')) fallbackExample = 'Kec. Coblong, Kec. Sukajadi';
      else if (labelLower.includes('jalan') || labelLower.includes('alamat')) fallbackExample = 'Jl. Merdeka No. 45, RT 02/RW 05';
      else if (labelLower.includes('email')) fallbackExample = 'nama@student.itera.ac.id';
      else if (labelLower.includes('telepon') || labelLower.includes('hp') || labelLower.includes('wa')) fallbackExample = '081234567890';

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

  const handleHighlight = () => {
    if (!currentNode) return;
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'HIGHLIGHT_FIELD',
            payload: { selector: currentNode.source.selector },
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
      utterance.rate = 0.9; // Kecepatan bicara dibuat sedikit lebih lambat & jelas
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

  const handleRefreshForm = async () => {
    await scanTabForm();
  };

  // Dynamic Typography Styles
  const fontTitleClass = textSize === 'xlarge' ? 'text-2xl' : textSize === 'large' ? 'text-xl' : 'text-lg';
  const fontBodyClass = textSize === 'xlarge' ? 'text-lg' : textSize === 'large' ? 'text-base' : 'text-sm';

  // High Contrast Themes
  const containerStyle = highContrast
    ? 'bg-black text-yellow-300 min-h-screen p-4 border-l-4 border-yellow-400 font-sans'
    : 'bg-slate-50 text-slate-900 min-h-screen p-4 border-l border-slate-200 font-sans';

  const cardStyle = highContrast
    ? 'border-2 border-yellow-300 bg-black p-4 rounded-xl space-y-4'
    : 'border-2 border-blue-200 bg-white p-4 rounded-xl shadow-sm space-y-4';

  const buttonPrimary = highContrast
    ? 'bg-yellow-300 text-black font-extrabold hover:bg-yellow-400 focus:ring-4 focus:ring-white'
    : 'bg-blue-700 text-white font-bold hover:bg-blue-800 focus:ring-4 focus:ring-blue-300';

  if (!formGraph || !formGraph.nodes || formGraph.nodes.length === 0) {
    return (
      <div className={`${containerStyle} flex flex-col items-center justify-center space-y-6 text-center min-h-screen`}>
        <div className="w-16 h-16 bg-blue-700 text-white rounded-full flex items-center justify-center font-bold text-2xl shadow-lg">
          A
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black">Formulir Belum Siap</h2>
          <p className={`${fontBodyClass} opacity-90 max-w-xs`}>
            Buka halaman yang memiliki formulir di web, lalu tekan tombol besar di bawah.
          </p>
        </div>
        <button
          onClick={scanTabForm}
          className={`${buttonPrimary} text-lg px-6 py-4 rounded-xl shadow-lg border-2 w-full max-w-xs`}
          aria-label="Memindai Ulang Formulir pada Tab Aktif"
        >
          🔄 Pindai Formulir Web
        </button>
      </div>
    );
  }

  const activeAi = currentNode ? aiResults[currentNode.nodeId] : undefined;

  return (
    <div className={`${containerStyle} flex flex-col justify-between min-h-screen`}>
      {/* 🟢 HEADER ACCESSIBILITY BAR */}
      <header className="space-y-3">
        <div className="flex items-center justify-between border-b pb-3 border-current">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-700 text-white rounded-lg flex items-center justify-center font-black text-lg">
              A
            </div>
            <div>
              <h1 className="font-extrabold text-lg leading-tight">Aksesara</h1>
              <p className="text-xs font-medium opacity-80 truncate max-w-[140px]">
                {formGraph.title || 'Formulir Web'}
              </p>
            </div>
          </div>

          {/* Tombol Pindai Ulang Menonjol */}
          <button
            onClick={handleRefreshForm}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border-2 transition-all ${
              highContrast
                ? 'border-yellow-300 text-yellow-300 hover:bg-yellow-300 hover:text-black'
                : 'border-blue-600 bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
            title="Pindai ulang halaman jika pertanyaan belum muncul"
            aria-label="Pindai Ulang Formulir Halaman Ini"
          >
            <span className="text-base">🔄</span>
            <span>Pindai Ulang</span>
          </button>
        </div>

        {/* 🛠️ TOOLBAR AKSESIBILITAS UTAMA */}
        <div
          className={`p-3 rounded-xl flex items-center justify-between gap-2 ${
            highContrast ? 'bg-zinc-900 border border-yellow-300' : 'bg-slate-200 text-slate-900'
          }`}
          role="region"
          aria-label="Pengaturan Aksesibilitas Teks dan Kontras"
        >
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold uppercase tracking-wider mr-1">Teks:</span>
            <button
              onClick={() => setTextSize('normal')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md min-h-[36px] ${
                textSize === 'normal' ? 'bg-blue-700 text-white' : 'bg-white text-black'
              }`}
              aria-label="Ukuran Teks Normal"
            >
              A
            </button>
            <button
              onClick={() => setTextSize('large')}
              className={`px-2.5 py-1 text-sm font-bold rounded-md min-h-[36px] ${
                textSize === 'large' ? 'bg-blue-700 text-white' : 'bg-white text-black'
              }`}
              aria-label="Ukuran Teks Besark"
            >
              A+
            </button>
            <button
              onClick={() => setTextSize('xlarge')}
              className={`px-2.5 py-1 text-base font-black rounded-md min-h-[36px] ${
                textSize === 'xlarge' ? 'bg-blue-700 text-white' : 'bg-white text-black'
              }`}
              aria-label="Ukuran Teks Sangat Besar"
            >
              A++
            </button>
          </div>

          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`px-3 py-1.5 rounded-md text-xs font-bold border-2 min-h-[36px] ${
              highContrast ? 'bg-yellow-300 text-black border-yellow-300' : 'bg-slate-800 text-white border-slate-800'
            }`}
          >
            {highContrast ? '☀️ Normal' : '🌙 Kontras'}
          </button>
        </div>
      </header>

      {/* 🟡 AREA ISI UTAMA PERTANYAAN */}
      <main className="my-4 flex-1">
        {!isReviewing && currentNode ? (
          <div className="space-y-4" role="aria-live" aria-live="polite">
            {/* Indikator Langkah */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold text-sm">
                <span>Pertanyaan {currentIndex + 1} dari {formGraph.nodes.length}</span>
                <span>{Math.round(((currentIndex + 1) / formGraph.nodes.length) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-300 h-3 rounded-full overflow-hidden">
                <div
                  className={`h-3 transition-all duration-300 ${highContrast ? 'bg-yellow-300' : 'bg-blue-700'}`}
                  style={{ width: `${((currentIndex + 1) / formGraph.nodes.length) * 100}%` }}
                />
              </div>
            </div>

            {/* KOTAK PERTANYAAN */}
            <div className={cardStyle}>
              <div className="flex justify-between items-start gap-2">
                <h2 className={`${fontTitleClass} font-black leading-snug`}>
                  {currentNode.simpleLabel || currentNode.officialLabel}
                  {currentNode.required && <span className="text-red-500 ml-1" aria-label="Wajib diisi">*</span>}
                </h2>

                {/* Tombol Audio Bantuan */}
                <button
                  onClick={() =>
                    isSpeaking
                      ? stopSpeak()
                      : handleSpeak(currentNode.simpleLabel || currentNode.officialLabel)
                  }
                  className={`p-3 rounded-full text-lg shrink-0 flex items-center justify-center font-bold min-w-[48px] min-h-[48px] ${
                    isSpeaking
                      ? 'bg-red-600 text-white animate-pulse'
                      : highContrast
                      ? 'bg-yellow-300 text-black'
                      : 'bg-blue-100 text-blue-900 border-2 border-blue-300'
                  }`}
                  title="Bacakan Pertanyaan"
                  aria-label="Bacakan Teks Pertanyaan Ini"
                >
                  🔊
                </button>
              </div>

              {/* BANTUAN AI (Satu Kolom yang Jelas) */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => callGeminiAi('explanation')}
                  disabled={aiLoading}
                  className={`py-3 px-2 rounded-xl text-xs font-extrabold border-2 min-h-[44px] flex items-center justify-center gap-1 ${
                    aiMode === 'explanation'
                      ? 'bg-blue-700 text-white border-blue-900'
                      : 'bg-blue-50 text-blue-900 border-blue-300 hover:bg-blue-100'
                  }`}
                >
                  {aiLoading && aiMode === 'explanation' ? '⏳ Memuat...' : '💡 Penjelasan (AI)'}
                </button>

                <button
                  onClick={() => callGeminiAi('example')}
                  disabled={aiLoading}
                  className={`py-3 px-2 rounded-xl text-xs font-extrabold border-2 min-h-[44px] flex items-center justify-center gap-1 ${
                    aiMode === 'example'
                      ? 'bg-purple-700 text-white border-purple-900'
                      : 'bg-purple-50 text-purple-900 border-purple-300 hover:bg-purple-100'
                  }`}
                >
                  {aiLoading && aiMode === 'example' ? '⏳ Memuat...' : '📝 Contoh (AI)'}
                </button>
              </div>

              {/* AI Result Cards */}
              {aiMode === 'explanation' && activeAi?.explanation && (
                <div className={`p-3 rounded-lg border-2 text-sm ${highContrast ? 'bg-zinc-900 border-yellow-300' : 'bg-blue-50 border-blue-300 text-blue-950'}`}>
                  <strong className="block mb-1">💡 Penjelasan:</strong>
                  <p className={fontBodyClass}>{activeAi.explanation}</p>
                </div>
              )}

              {aiMode === 'example' && activeAi?.example && (
                <div className={`p-3 rounded-lg border-2 text-sm ${highContrast ? 'bg-zinc-900 border-yellow-300' : 'bg-purple-50 border-purple-300 text-purple-950'}`}>
                  <strong className="block mb-1">📝 Contoh Jawaban:</strong>
                  <p className={`${fontBodyClass} font-bold p-2 bg-white rounded border border-purple-200 text-slate-900`}>
                    {activeAi.example}
                  </p>
                </div>
              )}

              {/* INPUT FORM UTAMA */}
              <div className="pt-2">
                {currentNode.fieldType === 'textarea' ? (
                  <textarea
                    rows={4}
                    value={answers[currentNode.nodeId] || ''}
                    onChange={(e) => handleValueChange(e.target.value)}
                    className={`w-full p-4 border-2 rounded-xl font-medium focus:ring-4 ${fontBodyClass} ${
                      highContrast ? 'bg-black text-yellow-300 border-yellow-300' : 'bg-white text-slate-900 border-slate-400 focus:ring-blue-300'
                    }`}
                    placeholder="Tuliskan jawaban Anda di sini..."
                    aria-label={currentNode.simpleLabel || currentNode.officialLabel}
                  />
                ) : currentNode.fieldType === 'select' ? (
                  <select
                    value={answers[currentNode.nodeId] || ''}
                    onChange={(e) => handleValueChange(e.target.value)}
                    className={`w-full p-4 border-2 rounded-xl font-bold min-h-[52px] ${fontBodyClass} ${
                      highContrast ? 'bg-black text-yellow-300 border-yellow-300' : 'bg-white text-slate-900 border-slate-400 focus:ring-blue-300'
                    }`}
                    aria-label={currentNode.simpleLabel || currentNode.officialLabel}
                  >
                    <option value="">-- Klik untuk Pilih Jawaban --</option>
                    {currentNode.options?.map((opt, i) => (
                      <option key={i} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={currentNode.fieldType === 'number' ? 'number' : 'text'}
                    value={answers[currentNode.nodeId] || ''}
                    onChange={(e) => handleValueChange(e.target.value)}
                    className={`w-full p-4 border-2 rounded-xl font-medium min-h-[52px] ${fontBodyClass} ${
                      highContrast ? 'bg-black text-yellow-300 border-yellow-300' : 'bg-white text-slate-900 border-slate-400 focus:ring-blue-300'
                    }`}
                    placeholder="Ketik jawaban Anda..."
                    aria-label={currentNode.simpleLabel || currentNode.officialLabel}
                  />
                )}
              </div>

              {/* BANTUAN SOROTAN & TEKS ASLI */}
              <div className="flex justify-between items-center pt-2 text-xs border-t border-current">
                <button
                  onClick={() => setShowOriginalText(!showOriginalText)}
                  className="font-bold underline text-blue-600 dark:text-yellow-300 py-1"
                >
                  {showOriginalText ? 'Sembunyikan Label Asli' : 'Lihat Label Asli Web'}
                </button>

                <button
                  onClick={handleHighlight}
                  className="p-2 bg-slate-200 text-slate-900 font-bold rounded-lg border border-slate-400"
                >
                  🔍 Temukan di Web
                </button>
              </div>

              {showOriginalText && (
                <div className="bg-slate-100 text-slate-900 p-3 rounded-lg border font-mono text-xs">
                  {currentNode.officialLabel}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* RINGKASAN JAWABAN (REVIEW STEP) */
          <div className="space-y-4">
            <h2 className="text-2xl font-black">Ringkasan Jawaban</h2>
            <p className={fontBodyClass}>Periksa jawaban Anda sebelum dikirimkan ke web asli:</p>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {formGraph.nodes.map((node, i) => {
                const val = answers[node.nodeId];
                return (
                  <div key={node.nodeId} className={`p-4 rounded-xl border-2 flex justify-between items-center ${
                    highContrast ? 'border-yellow-300 bg-black' : 'border-slate-300 bg-white'
                  }`}>
                    <div>
                      <div className="font-bold text-sm opacity-80">{node.simpleLabel || node.officialLabel}</div>
                      <div className="font-extrabold text-base mt-1 text-blue-700 dark:text-yellow-300">
                        {val || <span className="text-red-500 italic">Belum Diisi</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIsReviewing(false);
                        setCurrentIndex(i);
                      }}
                      className="px-3 py-2 bg-slate-200 text-slate-900 font-bold rounded-lg underline text-xs min-h-[40px]"
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

      {/* 🔴 FOOTER TOMBOL NAVIGASI SANGAT BESAR */}
      <footer className="pt-4 border-t-2 border-current mt-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleBack}
            disabled={currentIndex === 0 && !isReviewing}
            className={`py-4 px-4 rounded-xl font-black text-base border-2 min-h-[52px] flex items-center justify-center ${
              currentIndex === 0 && !isReviewing
                ? 'opacity-30 bg-slate-300 text-slate-600 border-slate-300'
                : 'bg-slate-200 text-slate-900 hover:bg-slate-300 border-slate-400'
            }`}
          >
            ⬅️ Kembali
          </button>

          {!isReviewing ? (
            <button
              onClick={handleNext}
              className={`${buttonPrimary} py-4 px-4 rounded-xl text-base min-h-[52px] flex items-center justify-center shadow-lg`}
            >
              {currentIndex === formGraph.nodes.length - 1 ? 'Tinjau 📋' : 'Lanjut ➡️'}
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
              className="bg-emerald-600 text-white font-black hover:bg-emerald-700 py-4 px-4 rounded-xl text-base min-h-[52px] shadow-lg col-span-2"
            >
              Kirim Formulir di Web Asli
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}