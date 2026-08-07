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
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [highContrast, setHighContrast] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Initial scanning request on mount
    scanTabForm();

    // Listen for form scan broadcasts from content script
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

  const scanTabForm = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'SCAN_FORM' }, (res) => {
            if (res?.graph) {
              initFormGraph(res.graph);
            }
          });
        }
      });
    }
  };

  const initFormGraph = (graph: FormGraph) => {
    setFormGraph(graph);
    const initialAnswers: Record<string, any> = {};
    graph.nodes.forEach((node) => {
      initialAnswers[node.nodeId] = node.currentValue || '';
    });
    setAnswers(initialAnswers);
  };

  const currentNode: FormNode | undefined = formGraph?.nodes[currentIndex];

  // Request AI Assistance from Backend (Google Gemini API)
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
      console.error('Error fetching Gemini AI:', error);
      
      // Contextual client fallback if backend is unreachable
      let fallbackExample = 'Contoh: Isikan data sesuai dokumen resmi Anda.';
      const labelLower = currentNode.officialLabel.toLowerCase();
      if (labelLower.includes('lahir')) {
        fallbackExample = 'Contoh: Bandung, Jakarta, Medan, Lampung';
      } else if (labelLower.includes('kecamatan') || labelLower.includes('wil')) {
        fallbackExample = 'Contoh: Kec. Coblong, Kec. Sukajadi, Kec. Tiga Panah';
      } else if (labelLower.includes('jalan') || labelLower.includes('alamat')) {
        fallbackExample = 'Contoh: Jl. Merdeka No. 45, RT 02/RW 05';
      } else if (labelLower.includes('gaji') || labelLower.includes('penghasilan') || labelLower.includes('income')) {
        fallbackExample = 'Contoh: Rp 3.500.000,00';
      } else if (labelLower.includes('email')) {
        fallbackExample = 'Contoh: nama@student.itera.ac.id';
      } else if (labelLower.includes('telepon') || labelLower.includes('hp') || labelLower.includes('wa')) {
        fallbackExample = 'Contoh: 081234567890';
      }

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

    // Synchronize directly to DOM of target page
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
      utterance.rate = 1.0;
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
    if (!formGraph) return;
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

  // Font size classes
  const fontClass =
    textSize === 'xlarge' ? 'text-xl' : textSize === 'large' ? 'text-lg' : 'text-base';

  // Contrast container style
  const containerStyle = highContrast
    ? 'bg-black text-yellow-300 min-h-screen border-l border-yellow-400'
    : 'bg-white text-gray-900 min-h-screen border-l border-gray-200';

  if (!formGraph || formGraph.nodes.length === 0) {
    return (
      <div className={`${containerStyle} p-6 flex flex-col items-center justify-center space-y-4 text-center`}>
        <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xl">
          A
        </div>
        <h2 className="text-xl font-bold">Belum Ada Formulir Terdeteksi</h2>
        <p className="text-sm opacity-80 max-w-xs">
          Buka halaman web yang memiliki formulir isian, lalu tekan tombol di bawah untuk memindai ulang.
        </p>
        <button
          onClick={scanTabForm}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-5 py-2.5 rounded-lg shadow"
        >
          Pindai Formulir Tab Aktif
        </button>
      </div>
    );
  }

  const activeAi = currentNode ? aiResults[currentNode.nodeId] : undefined;

  return (
    <div className={`${containerStyle} p-4 font-sans flex flex-col justify-between`}>
      {/* Header Bar */}
      <div>
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
              A
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">Aksesara</h1>
              <p className="text-[10px] opacity-75">
                {formGraph.title || 'Formulir Web'}
              </p>
            </div>
          </div>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              formGraph.mode === 'verified'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {formGraph.mode === 'verified' ? '✓ Terverifikasi' : 'Mode Universal'}
          </span>
        </div>

        {/* Accessibility Toolbar */}
        <div className="flex items-center justify-between bg-gray-100 text-gray-800 p-2 rounded-lg text-xs mb-4">
          <div className="flex items-center space-x-1">
            <span className="font-semibold text-[10px] uppercase tracking-wider">Ukuran Teks:</span>
            <button
              onClick={() => setTextSize('normal')}
              className={`px-2 py-0.5 rounded ${textSize === 'normal' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              A
            </button>
            <button
              onClick={() => setTextSize('large')}
              className={`px-2 py-0.5 rounded text-sm ${textSize === 'large' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              A+
            </button>
            <button
              onClick={() => setTextSize('xlarge')}
              className={`px-2 py-0.5 rounded text-base font-bold ${textSize === 'xlarge' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              A++
            </button>
          </div>

          <button
            onClick={() => setHighContrast(!highContrast)}
            className="bg-gray-800 text-white px-2 py-1 rounded text-[11px] font-medium"
          >
            {highContrast ? 'Mode Normal' : 'Kontras Tinggi'}
          </button>
        </div>

        {/* Main Content Area */}
        {!isReviewing && currentNode ? (
          <div className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Langkah {currentIndex + 1} dari {formGraph.nodes.length}</span>
                <span>{Math.round(((currentIndex + 1) / formGraph.nodes.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-2 transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / formGraph.nodes.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Box */}
            <div className="border p-4 rounded-xl space-y-3 bg-opacity-10">
              <div className="flex justify-between items-start">
                <h2 className={`${fontClass} font-bold leading-snug`}>
                  {currentNode.simpleLabel || currentNode.officialLabel}
                  {currentNode.required && <span className="text-red-500 ml-1">*</span>}
                </h2>

                <button
                  onClick={() =>
                    isSpeaking
                      ? stopSpeak()
                      : handleSpeak(currentNode.simpleLabel || currentNode.officialLabel)
                  }
                  className="bg-blue-100 hover:bg-blue-200 text-blue-800 p-2 rounded-full text-xs flex items-center justify-center shrink-0 ml-2"
                  title="Dengarkan Suara"
                >
                  🔊
                </button>
              </div>

              {/* 2 Gemini AI Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => callGeminiAi('explanation')}
                  disabled={aiLoading}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all border flex items-center justify-center gap-1 shadow-sm ${
                    aiMode === 'explanation'
                      ? 'bg-blue-600 text-white border-blue-700'
                      : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                  }`}
                >
                  {aiLoading && aiMode === 'explanation' ? '⏳ Memuat AI...' : '💡 Penjelasan (AI)'}
                </button>

                <button
                  onClick={() => callGeminiAi('example')}
                  disabled={aiLoading}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all border flex items-center justify-center gap-1 shadow-sm ${
                    aiMode === 'example'
                      ? 'bg-purple-600 text-white border-purple-700'
                      : 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100'
                  }`}
                >
                  {aiLoading && aiMode === 'example' ? '⏳ Memuat AI...' : '📝 Contoh Jawaban (AI)'}
                </button>
              </div>

              {/* AI Explanation Box */}
              {aiMode === 'explanation' && activeAi?.explanation && (
                <div className="text-xs bg-blue-50 border border-blue-200 text-blue-900 p-3 rounded-lg space-y-1">
                  <div className="font-bold flex items-center gap-1 text-blue-800">
                    <span>💡 Penjelasan Singkat (Gemini AI):</span>
                  </div>
                  <p className="leading-relaxed font-medium">{activeAi.explanation}</p>
                </div>
              )}

              {/* AI Example Box */}
              {aiMode === 'example' && activeAi?.example && (
                <div className="text-xs bg-purple-50 border border-purple-200 text-purple-900 p-3 rounded-lg space-y-1">
                  <div className="font-bold flex items-center gap-1 text-purple-800">
                    <span>📝 Contoh Jawaban (Gemini AI):</span>
                  </div>
                  <p className="font-semibold text-purple-950 bg-white p-2.5 rounded border border-purple-200 leading-relaxed">
                    {activeAi.example}
                  </p>
                </div>
              )}

              {/* Original Help Text (if no AI mode active) */}
              {!aiMode && currentNode.helpText && (
                <div className="text-xs bg-gray-50 text-gray-800 p-2.5 rounded-lg border border-gray-200">
                  💡 {currentNode.helpText}
                </div>
              )}

              {/* Input Component */}
              <div className="pt-1">
                {currentNode.fieldType === 'textarea' ? (
                  <textarea
                    rows={4}
                    value={answers[currentNode.nodeId] || ''}
                    onChange={(e) => handleValueChange(e.target.value)}
                    className="w-full p-3 border rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-600"
                    placeholder="Tuliskan jawaban Anda di sini..."
                  />
                ) : currentNode.fieldType === 'select' ? (
                  <select
                    value={answers[currentNode.nodeId] || ''}
                    onChange={(e) => handleValueChange(e.target.value)}
                    className="w-full p-3 border rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">-- Pilih Salah Satu --</option>
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
                    className="w-full p-3 border rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-600"
                    placeholder={currentNode.example ? `Contoh: ${currentNode.example}` : 'Ketik jawaban Anda...'}
                  />
                )}
              </div>

              {/* Helper Tools */}
              <div className="flex justify-between items-center pt-2 text-xs border-t">
                <button
                  onClick={() => setShowOriginalText(!showOriginalText)}
                  className="text-blue-600 underline font-medium"
                >
                  {showOriginalText ? 'Sembunyikan Teks Asli' : 'Lihat Teks Asli Web'}
                </button>

                <button
                  onClick={handleHighlight}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-2.5 py-1.5 rounded font-medium border"
                >
                  🔍 Temukan di Halaman Web
                </button>
              </div>

              {/* Original Text Drawer */}
              {showOriginalText && (
                <div className="bg-gray-100 text-gray-800 p-3 rounded text-xs border space-y-1">
                  <div className="font-semibold text-gray-700">Teks Asli Label Website:</div>
                  <div className="font-mono bg-white p-2 rounded border">{currentNode.officialLabel}</div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Review Step Summary */
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Ringkasan Pengisian Formulir</h2>
            <p className="text-xs opacity-80">
              Periksa kembali jawaban Anda. Semua nilai telah disinkronkan langsung ke halaman website asli.
            </p>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {formGraph.nodes.map((node, i) => {
                const val = answers[node.nodeId];
                const isMasked = node.sensitivity === 'financial' || node.sensitivity === 'identity';

                return (
                  <div key={node.nodeId} className="border p-3 rounded-lg text-xs flex justify-between items-center bg-gray-50 text-gray-900">
                    <div>
                      <div className="font-semibold text-gray-700">{node.simpleLabel || node.officialLabel}</div>
                      <div className="font-mono text-blue-700 mt-0.5">
                        {val ? (isMasked ? '••••••••' : String(val)) : <span className="text-red-500 italic">Belum diisi</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIsReviewing(false);
                        setCurrentIndex(i);
                      }}
                      className="text-blue-600 underline text-xs"
                    >
                      Ubah
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation Buttons */}
      <div className="flex justify-between items-center pt-4 border-t mt-6">
        <button
          onClick={handleBack}
          disabled={currentIndex === 0 && !isReviewing}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold text-sm rounded-lg disabled:opacity-40"
        >
          &larr; Kembali
        </button>

        {!isReviewing ? (
          <button
            onClick={handleNext}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow"
          >
            {currentIndex === formGraph.nodes.length - 1 ? 'Tinjau Jawaban' : 'Lanjut &rarr;'}
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
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg shadow"
          >
            Kirim Formulir di Website Asli
          </button>
        )}
      </div>
    </div>
  );
}
