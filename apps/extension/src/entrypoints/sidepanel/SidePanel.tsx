import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  RefreshCw,
  Settings,
  ChevronDown,
  MessageSquareText,
  FileText,
  Sparkles,
  Eye,
  ChevronLeft,
  ChevronRight,
  Lock,
  Type,
  Contrast,
  Volume2,
  VolumeX,
  Check,
} from "lucide-react";
import { FormGraph, FormNode } from "@aksesara/form-schema";

// 💡 Label Normalizer (Converts technical names like "id_wil_kabupaten" -> "Kabupaten")
const formatDisplayLabel = (label: string): string => {
  if (!label) return "Pertanyaan";
  let cleaned = label.trim();

  const labelMap: Record<string, string> = {
    id_wil_kabupaten: "Kabupaten",
    id_wil_provinsi: "Provinsi",
    id_wil_kecamatan: "Kecamatan",
    id_wil_kelurahan: "Kelurahan",
    nik: "NIK",
    nisn: "NISN",
    tgl_lahir: "Tanggal Lahir",
    tmpt_lahir: "Tempat Lahir",
    no_hp: "Nomor HP",
    no_telp: "Nomor Telepon",
    email: "Email",
  };

  const lower = cleaned.toLowerCase();
  if (labelMap[lower]) return labelMap[lower];

  if (cleaned.includes("_")) {
    cleaned = cleaned
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

export default function SidePanel() {
  const [formGraph, setFormGraph] = useState<FormGraph | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isReviewing, setIsReviewing] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Accessibility State
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState<number>(1.0);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(false);

  // UI Interactive States
  const [showSettingsMenu, setShowSettingsMenu] = useState<boolean>(false);
  const [showSelectMenu, setShowSelectMenu] = useState<boolean>(false);
  const [activeAiView, setActiveAiView] = useState<"none" | "explanation" | "example">("none");
  const [aiLoadingType, setAiLoadingType] = useState<"none" | "explanation" | "example">("none");

  // AI Cache per Node
  const [aiResults, setAiResults] = useState<
    Record<
      string,
      {
        simpleLabel: string;
        helpText: string;
        exampleFormat: string;
        warnings?: string[];
        source?: string;
      }
    >
  >({});

  useEffect(() => {
    scanTabForm();

    if (typeof chrome !== "undefined" && chrome.runtime) {
      const messageListener = (message: any) => {
        if (message.type === "FORM_SCANNED" && message.payload) {
          initFormGraph(message.payload);
        }
      };

      chrome.runtime.onMessage.addListener(messageListener);
      return () => {
        chrome.runtime.onMessage.removeListener(messageListener);
      };
    }
  }, []);

  const clearPageHighlights = () => {
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0]?.id;
        if (tabId != null) {
          chrome.tabs.sendMessage(tabId, { type: "CLEAR_HIGHLIGHTS" });
        }
      });
    }
  };

  const scanTabForm = () => {
    setIsScanning(true);
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        const tabId = activeTab?.id;
        if (tabId == null) {
          setIsScanning(false);
          return;
        }

        if (chrome.scripting) {
          try {
            chrome.scripting.executeScript({
              target: { tabId },
              files: ["content-scripts/content.js"],
            });
          } catch (e) {}
        }

        chrome.tabs.sendMessage(tabId, { type: "SCAN_FORM" }, (res) => {
          setIsScanning(false);
          if (chrome.runtime.lastError) {
            chrome.tabs.sendMessage(tabId, { type: "PARSE_FORM" }, (resParse) => {
              const graphData = resParse?.graph || (resParse?.forms ? resParse.forms[0] : null);
              if (graphData) initFormGraph(graphData);
            });
            return;
          }

          const graphData = res?.graph || (res?.forms ? res.forms[0] : null);
          if (graphData) initFormGraph(graphData);
        });
      });
    } else {
      setIsScanning(false);
    }
  };

  const initFormGraph = (graph: FormGraph) => {
    setFormGraph(graph);
    setCurrentIndex(0);
    setIsReviewing(false);
    setActiveAiView("none");

    const initialAnswers: Record<string, any> = {};
    if (graph.nodes) {
      graph.nodes.forEach((node) => {
        initialAnswers[node.nodeId] = node.currentValue || "";
      });
    }
    setAnswers(initialAnswers);
  };

  const currentNode: FormNode | undefined = formGraph?.nodes?.[currentIndex];

  const handleToggleFontSize = () => {
    const steps = [1.0, 1.25, 1.5, 1.75];
    const nextIndex = (steps.indexOf(fontSizeMultiplier) + 1) % steps.length;
    setFontSizeMultiplier(steps[nextIndex]);
  };

  const speakText = (text: string) => {
    if (ttsEnabled && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "id-ID";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const callGeminiAi = async (requestedView: "explanation" | "example") => {
    if (!currentNode) return;
    setAiLoadingType(requestedView);
    setActiveAiView(requestedView);

    const sanitizedPayload = {
      fields: [
        {
          nodeId: currentNode.nodeId,
          officialLabel: currentNode.officialLabel,
          fieldType: currentNode.fieldType,
          instruction: currentNode.helpText || "",
          requestedMode: requestedView,
        },
      ],
    };

    let data: any = null;
    const endpoints = [
      "http://localhost:4000/api/v1/assist/fields",
      "http://localhost:3000/api/v1/assist/fields",
      "http://localhost:4000/api/v1/ai/field-assistance",
      "http://localhost:3000/api/v1/ai/field-assistance",
    ];

    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sanitizedPayload),
        });
        if (res.ok) {
          data = await res.json();
          break;
        }
      } catch (e) {}
    }

    if (data && data.fields?.[0]) {
      const aiOutput = data.fields[0];
      setAiResults((prev) => ({
        ...prev,
        [currentNode.nodeId]: {
          simpleLabel: aiOutput.simpleLabel || formatDisplayLabel(currentNode.officialLabel),
          helpText: aiOutput.helpText || `Isikan data ${formatDisplayLabel(currentNode.officialLabel)} Anda.`,
          exampleFormat: aiOutput.exampleFormat || "Contoh: Data Valid",
          warnings: aiOutput.warnings || [],
          source: aiOutput.source || "groq",
        },
      }));

      if (ttsEnabled) {
        const textToSpeak =
          requestedView === "explanation"
            ? aiOutput.helpText
            : `${aiOutput.helpText}. Contoh: ${aiOutput.exampleFormat}`;
        if (textToSpeak) speakText(textToSpeak);
      }
    } else {
      const displayLabel = formatDisplayLabel(currentNode.officialLabel);
      let fallbackHelp = `Isikan data ${displayLabel} sesuai dengan dokumen resmi Anda.`;
      let fallbackExample = "Contoh: Data Valid";
      const labelLower = (currentNode.officialLabel || "").toLowerCase();

      if (labelLower.includes("telepon") || labelLower.includes("hp")) {
        fallbackHelp = "Isikan nomor telepon atau WhatsApp aktif yang dapat dihubungi.";
        fallbackExample = "Contoh: 081234567890";
      } else if (labelLower.includes("nisn")) {
        fallbackHelp = "Isikan Nomor Induk Siswa Nasional (NISN) 10 digit yang terdaftar.";
        fallbackExample = "Contoh: 0051234567";
      } else if (labelLower.includes("nik")) {
        fallbackHelp = "Isikan Nomor Induk Kependudukan (NIK) 16 digit tertera pada KTP atau KK.";
        fallbackExample = "Contoh: 3171012345670001";
      } else if (labelLower.includes("email")) {
        fallbackHelp = "Isikan alamat email aktif untuk menerima konfirmasi atau informasi.";
        fallbackExample = "Contoh: nama@domain.com";
      } else if (labelLower.includes("lahir")) {
        fallbackHelp = "Isikan tempat kelahiran Anda sesuai dengan akta atau KTP.";
        fallbackExample = "Contoh: Bandung";
      }

      setAiResults((prev) => ({
        ...prev,
        [currentNode.nodeId]: {
          simpleLabel: displayLabel,
          helpText: fallbackHelp,
          exampleFormat: fallbackExample,
          source: "fallback",
        },
      }));
    }
    setAiLoadingType("none");
  };

  const handleValueChange = (val: any) => {
    if (!currentNode) return;
    setAnswers((prev) => ({ ...prev, [currentNode.nodeId]: val }));

    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0]?.id;
        if (tabId != null) {
          chrome.tabs.sendMessage(tabId, {
            type: "SYNC_FIELD_VALUE",
            payload: {
              selector: currentNode.source?.selector || (currentNode.source as any)?.cssSelector,
              cssSelector: (currentNode.source as any)?.cssSelector || currentNode.source?.selector,
              id: currentNode.source?.id,
              name: currentNode.source?.name,
              value: val,
            },
          });
        }
      });
    }
  };

  const handleHighlightElement = () => {
    if (!currentNode) return;
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0]?.id;
        if (tabId != null) {
          chrome.tabs.sendMessage(tabId, {
            type: "HIGHLIGHT_FIELD",
            payload: {
              selector: currentNode.source?.selector || (currentNode.source as any)?.cssSelector,
              cssSelector: (currentNode.source as any)?.cssSelector || currentNode.source?.selector,
              id: currentNode.source?.id,
              name: currentNode.source?.name,
              label: currentNode.officialLabel,
            },
          });
        }
      });
    }
  };

  const handleNext = () => {
    if (!formGraph || !formGraph.nodes) return;
    clearPageHighlights();
    if (currentIndex < formGraph.nodes.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setIsReviewing(false);
      const nextNode = formGraph.nodes[nextIdx];
      if (nextNode && ttsEnabled) {
        speakText(`Pertanyaan ${nextIdx + 1}: ${formatDisplayLabel(nextNode.officialLabel)}`);
      }
    } else {
      setIsReviewing(true);
    }
  };

  const handleBack = () => {
    if (!formGraph || !formGraph.nodes) return;
    clearPageHighlights();
    if (isReviewing) {
      setIsReviewing(false);
    } else if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      const prevNode = formGraph?.nodes?.[prevIdx];
      if (prevNode && ttsEnabled) {
        speakText(`Pertanyaan ${prevIdx + 1}: ${formatDisplayLabel(prevNode.officialLabel)}`);
      }
    }
  };

  const totalSteps = formGraph?.nodes?.length || 0;
  const percentage = totalSteps > 0 ? Math.round(((currentIndex + 1) / totalSteps) * 100) : 0;
  const currentDisplayTitle = currentNode ? formatDisplayLabel(currentNode.officialLabel) : "";
  const currentAnswerVal = currentNode ? answers[currentNode.nodeId] || "" : "";
  const currentAiResult = currentNode ? aiResults[currentNode.nodeId] : undefined;

  // High Contrast Theme Configuration (Black & Blue Mode - Pure Black/Dark Blue Background + Vibrant Blue Accents)
  const theme = highContrast
    ? {
        bg: "bg-[#0b0f19] text-white",
        headerBg: "bg-[#111827] border-[#1e293b]",
        cardBg: "bg-[#111827] border-[#1e293b] text-white",
        cardSub: "bg-[#1e293b] border-[#334155] text-slate-200",
        inputBg: "bg-[#030712] text-white border-2 border-[#3b82f6] focus:border-[#60a5fa] focus:ring-2 focus:ring-[#3b82f6]",
        btnPrimary: "bg-[#2563eb] text-white hover:bg-[#1d4ed8] font-bold shadow-md shadow-blue-500/20",
        btnSecondary: "bg-[#1e293b] text-[#60a5fa] border border-[#334155] hover:bg-[#334155] font-semibold",
        aiCardBg: "bg-[#0f172a] border border-[#2563eb]/60 text-blue-100",
        textTitle: "text-white font-bold",
        textMuted: "text-slate-300",
      }
    : {
        bg: "bg-white text-gray-900",
        headerBg: "bg-white border-gray-100",
        cardBg: "bg-white border-gray-200 text-gray-900",
        cardSub: "bg-gray-50/60 border-gray-200 text-gray-700",
        inputBg: "bg-white text-gray-900 border-gray-300 focus:border-blue-600 focus:ring-blue-600/20",
        btnPrimary: "bg-blue-600 text-white hover:bg-blue-700 font-semibold",
        btnSecondary: "bg-white text-gray-700 border-gray-200 hover:bg-gray-50",
        aiCardBg: "bg-blue-50/70 border-blue-100 text-blue-950",
        textTitle: "text-gray-900 font-bold",
        textMuted: "text-gray-500",
      };

  // Empty state when no forms are detected
  if (!formGraph || !formGraph.nodes || formGraph.nodes.length === 0) {
    return (
      <div className={`min-h-screen p-4 flex flex-col items-center justify-center space-y-6 text-center ${theme.bg}`}>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-bold">Formulir Belum Ditemukan</h2>
          <p className="text-xs max-w-xs leading-relaxed opacity-80">
            Buka halaman web yang memiliki formulir, lalu tekan tombol di bawah ini untuk memindai ulang.
          </p>
        </div>
        <button
          type="button"
          onClick={scanTabForm}
          disabled={isScanning}
          className={`w-full max-w-xs font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 ${theme.btnPrimary} disabled:opacity-50`}
        >
          <RefreshCw className={`h-4 w-4 ${isScanning ? "animate-spin" : ""}`} />
          <span>Pindai Ulang Form</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col justify-between ${theme.bg} transition-colors duration-150`}
      style={{ zoom: fontSizeMultiplier }}
    >
      {/* 🟢 TOP HEADER */}
      <header className={`px-4 pt-4 pb-2 border-b ${theme.headerBg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-lg font-bold tracking-tight ${highContrast ? "text-white" : "text-gray-900"}`}>Aksesara</h1>
              </div>
              <span className={`mt-0.5 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${highContrast ? "bg-blue-600/20 text-blue-400 border border-blue-500/40" : "bg-blue-50 text-blue-600 border border-blue-100/60"}`}>
                Universal Mode
              </span>
            </div>
          </div>

          {/* Settings Dropdown Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className={`rounded-full p-2 hover:bg-gray-100/10 focus:outline-none transition ${theme.textMuted}`}
              aria-label="Pengaturan"
            >
              <Settings className="h-5 w-5" />
            </button>

            {/* Accessible Settings Dropdown */}
            {showSettingsMenu && (
              <div className={`absolute right-0 mt-2 w-56 rounded-xl border p-2 shadow-lg z-30 space-y-1 ${highContrast ? "bg-[#111827] border-[#1e293b] text-white" : "bg-white border-gray-200 text-gray-800"}`}>
                <div className="px-2.5 py-1 text-[11px] font-semibold opacity-60 uppercase tracking-wider">
                  Aksesibilitas
                </div>

                <button
                  type="button"
                  onClick={handleToggleFontSize}
                  className="w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium hover:bg-gray-500/10 focus:outline-none"
                >
                  <div className="flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    <span>Ukuran Teks</span>
                  </div>
                  <span className="text-xs font-bold text-blue-500">{fontSizeMultiplier.toFixed(2)}x</span>
                </button>

                <button
                  type="button"
                  onClick={() => setHighContrast(!highContrast)}
                  className="w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium hover:bg-gray-500/10 focus:outline-none"
                >
                  <div className="flex items-center gap-2">
                    <Contrast className="h-4 w-4" />
                    <span>Kontras Tinggi (Hitam-Biru)</span>
                  </div>
                  {highContrast && <Check className="h-4 w-4 text-blue-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setTtsEnabled(!ttsEnabled)}
                  className="w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium hover:bg-gray-500/10 focus:outline-none"
                >
                  <div className="flex items-center gap-2">
                    {ttsEnabled ? <Volume2 className="h-4 w-4 text-blue-500" /> : <VolumeX className="h-4 w-4" />}
                    <span>Panduan Suara (TTS)</span>
                  </div>
                  {ttsEnabled && <Check className="h-4 w-4 text-blue-500" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Accessibility Toolbar Card */}
        <div className={`mt-3.5 flex items-center justify-around rounded-xl border p-2.5 text-xs font-medium ${theme.cardSub}`}>
          <button
            type="button"
            onClick={handleToggleFontSize}
            className="flex items-center gap-1.5 hover:opacity-80 transition focus:outline-none"
            title="Ubah ukuran teks (1.0x, 1.25x, 1.5x, 1.75x)"
          >
            <Type className="h-4 w-4" />
            <span>Teks {fontSizeMultiplier}x</span>
          </button>

          <div className="h-4 w-px bg-current opacity-20" />

          <button
            type="button"
            onClick={() => setHighContrast(!highContrast)}
            className={`flex items-center gap-1.5 hover:opacity-80 transition focus:outline-none ${highContrast ? "font-bold text-blue-400" : ""}`}
            title="Aktifkan mode kontras tinggi (Hitam-Biru)"
          >
            <Contrast className="h-4 w-4" />
            <span>Kontras</span>
          </button>

          <div className="h-4 w-px bg-current opacity-20" />

          <button
            type="button"
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`flex items-center gap-1.5 hover:opacity-80 transition focus:outline-none ${ttsEnabled ? "font-bold text-blue-500" : ""}`}
            title="Aktifkan panduan suara"
          >
            <Volume2 className="h-4 w-4" />
            <span>Suara</span>
          </button>
        </div>
      </header>

      {/* 🟡 FORM PROGRESS & QUESTION AREA */}
      <main className={`flex-1 px-4 py-3 space-y-4 ${theme.bg}`}>
        {!isReviewing && currentNode ? (
          <>
            {/* Form Progress Card */}
            <div className={`rounded-2xl border p-4 shadow-2xs space-y-3 ${theme.cardBg}`}>
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>
                  Langkah {currentIndex + 1} dari {totalSteps}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={scanTabForm}
                    disabled={isScanning}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-lg border transition ${highContrast ? "bg-blue-600/20 text-blue-400 border-blue-500/40" : "bg-blue-50 text-blue-600 border-blue-100"}`}
                    title="Pindai ulang dan baca formulir terbaru di halaman ini"
                  >
                    <RefreshCw className={`h-3 w-3 ${isScanning ? "animate-spin" : ""}`} />
                    <span>Cek formulir</span>
                  </button>
                  <span className="font-bold ml-1">{percentage}%</span>
                </div>
              </div>

              {/* Progress Bar Track */}
              <div className={`h-2 w-full rounded-full overflow-hidden ${highContrast ? "bg-[#1e293b]" : "bg-gray-100"}`}>
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${percentage}%` }}
                  role="progressbar"
                  aria-valuenow={currentIndex + 1}
                  aria-valuemin={1}
                  aria-valuemax={totalSteps}
                />
              </div>

              {/* Form Question Dropdown Jump Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSelectMenu(!showSelectMenu)}
                  className={`w-full rounded-xl border p-3 text-left flex items-center justify-between transition focus:outline-none ${theme.cardSub}`}
                >
                  <div>
                    <span className="block text-[11px] font-medium opacity-60">Formulir</span>
                    <span className="block text-sm font-semibold truncate">
                      {currentIndex + 1}. {currentDisplayTitle}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 shrink-0 ml-2 opacity-60" />
                </button>

                {/* Dropdown Options List */}
                {showSelectMenu && (
                  <div className={`absolute left-0 right-0 mt-1.5 max-h-56 overflow-y-auto rounded-xl border p-1.5 shadow-xl z-30 space-y-1 ${highContrast ? "bg-[#111827] border-[#1e293b] text-white" : "bg-white border-gray-200 text-gray-800"}`}>
                    {formGraph.nodes.map((node, index) => {
                      const isCurrent = index === currentIndex;
                      const val = answers[node.nodeId];
                      const isFilled = val && String(val).trim().length > 0;
                      const labelFormatted = formatDisplayLabel(node.officialLabel);

                      return (
                        <button
                          key={node.nodeId}
                          type="button"
                          onClick={() => {
                            clearPageHighlights();
                            setCurrentIndex(index);
                            setShowSelectMenu(false);
                          }}
                          className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition ${
                            isCurrent ? (highContrast ? "bg-blue-600/30 text-blue-400 font-bold" : "bg-blue-50 text-blue-700 font-semibold") : "hover:bg-gray-500/10"
                          }`}
                        >
                          <span className="truncate">
                            {index + 1}. {labelFormatted}
                          </span>
                          {isFilled && <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Active Question Title & Input Box */}
            <div className="space-y-4 pt-1">
              <div>
                <h2 className={`text-xl font-bold tracking-tight flex items-center gap-1 ${highContrast ? "text-white" : "text-gray-900"}`}>
                  <span>{currentDisplayTitle}</span>
                  {currentNode.required && <span className="text-red-500 text-sm font-bold">*</span>}
                </h2>

                <p className={`mt-1 text-xs leading-relaxed font-normal ${theme.textMuted}`}>
                  {currentNode.helpText || `Masukkan ${currentDisplayTitle.toLowerCase()} sesuai petunjuk formulir.`}
                </p>
              </div>

              {/* Input Box Section */}
              <div>
                <label htmlFor={`field_${currentNode.nodeId}`} className={`block text-xs font-semibold mb-1.5 ${highContrast ? "text-slate-200" : "text-gray-800"}`}>
                  Jawaban Anda
                </label>

                {renderFieldInput({
                  node: currentNode,
                  value: currentAnswerVal,
                  onChangeValue: handleValueChange,
                  highContrast,
                  theme,
                })}
              </div>

              {/* AI Action Buttons Side-by-Side */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => callGeminiAi("explanation")}
                  disabled={aiLoadingType !== "none"}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-semibold transition focus:outline-none disabled:opacity-50 ${
                    activeAiView === "explanation"
                      ? highContrast
                        ? "border-[#2563eb] bg-[#2563eb]/20 text-[#60a5fa]"
                        : "border-blue-600 bg-blue-50 text-blue-700 shadow-2xs"
                      : highContrast
                      ? "border-[#1e293b] bg-[#111827] text-slate-200 hover:bg-[#1e293b]"
                      : "border-gray-200 bg-gray-50/60 hover:bg-gray-100 text-blue-600"
                  }`}
                >
                  <MessageSquareText className="h-4 w-4 shrink-0" />
                  <span>{aiLoadingType === "explanation" ? "Memproses..." : "Jelaskan pertanyaan"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => callGeminiAi("example")}
                  disabled={aiLoadingType !== "none"}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-semibold transition focus:outline-none disabled:opacity-50 ${
                    activeAiView === "example"
                      ? highContrast
                        ? "border-[#2563eb] bg-[#2563eb]/20 text-[#60a5fa]"
                        : "border-blue-600 bg-blue-50 text-blue-700 shadow-2xs"
                      : highContrast
                      ? "border-[#1e293b] bg-[#111827] text-slate-200 hover:bg-[#1e293b]"
                      : "border-gray-200 bg-gray-50/60 hover:bg-gray-100 text-blue-600"
                  }`}
                >
                  <FileText className="h-4 w-4 shrink-0" />
                  <span>{aiLoadingType === "example" ? "Memproses..." : "Lihat contoh"}</span>
                </button>
              </div>

              {/* AI Result Card */}
              {currentAiResult && activeAiView !== "none" && (
                <div className={`rounded-xl border p-3.5 text-xs space-y-2.5 shadow-2xs ${theme.aiCardBg}`}>
                  <div className="flex items-center justify-between border-b border-current/20 pb-1.5">
                    <span className="font-semibold flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                      <span>Bantuan Aksesara AI</span>
                    </span>
                    {currentAiResult.source && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          highContrast
                            ? "bg-blue-600/20 text-blue-400 border border-blue-500/40"
                            : "bg-gray-100 text-gray-600 border border-gray-300"
                        }`}
                      >
                        {currentAiResult.source}
                      </span>
                    )}
                  </div>

                  {/* Penjelasan Sederhana (Full sentence explanatory response) */}
                  {(currentAiResult.helpText || currentAiResult.simpleLabel) && (
                    <div>
                      <span className="font-semibold block mb-0.5">Penjelasan Sederhana:</span>
                      <p className="leading-relaxed font-normal opacity-90">{currentAiResult.helpText || currentAiResult.simpleLabel}</p>
                    </div>
                  )}

                  {/* Contoh Jawaban (shown below Penjelasan when activeAiView === "example") */}
                  {activeAiView === "example" && currentAiResult.exampleFormat && (
                    <div className="pt-2 border-t border-current/20 space-y-1.5">
                      <span className="font-semibold block">Contoh Jawaban:</span>
                      <div className="flex items-center justify-between gap-2">
                        <div className={`font-mono text-xs px-2.5 py-1.5 rounded-lg border font-medium truncate flex-1 ${highContrast ? "bg-[#030712] text-blue-300 border-[#2563eb]/40" : "bg-white text-blue-800 border-blue-200"}`}>
                          {currentAiResult.exampleFormat}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleValueChange(currentAiResult.exampleFormat || "")}
                          className={`text-xs font-bold hover:underline shrink-0 px-2.5 py-1.5 rounded-lg border transition ${highContrast ? "bg-[#111827] text-blue-400 border-[#2563eb]/40" : "bg-white text-blue-600 border-blue-200"}`}
                        >
                          Gunakan contoh
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sorot di Halaman Web Button */}
              <button
                type="button"
                onClick={handleHighlightElement}
                className={`w-full flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-xs font-semibold transition focus:outline-none ${theme.btnSecondary}`}
              >
                <Eye className="h-4 w-4 shrink-0 text-blue-500" />
                <span>Sorot di halaman web</span>
              </button>
            </div>
          </>
        ) : (
          /* REVIEW SUMMARY STEP */
          <div className={`rounded-2xl border p-4 shadow-2xs space-y-3 ${theme.cardBg}`}>
            <h2 className="text-lg font-bold">Ringkasan Jawaban</h2>
            <p className="text-xs opacity-70">Periksa kembali jawaban Anda sebelum dikirimkan ke halaman web asli:</p>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {formGraph.nodes.map((node, i) => {
                const val = answers[node.nodeId];
                return (
                  <div key={node.nodeId} className={`p-3 rounded-xl border flex justify-between items-center text-xs ${theme.cardSub}`}>
                    <div>
                      <div className="font-semibold">{formatDisplayLabel(node.officialLabel)}</div>
                      <div className="font-medium mt-0.5 text-blue-400">{val || <span className="text-red-400 italic">Belum Diisi</span>}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        clearPageHighlights();
                        setIsReviewing(false);
                        setCurrentIndex(i);
                      }}
                      className="text-xs font-bold hover:underline text-blue-400"
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

      {/* 🔴 STICKY NAVIGATION FOOTER */}
      <footer className={`sticky bottom-0 z-20 border-t p-4 space-y-3 ${theme.headerBg}`}>
        <div className="flex items-center gap-3">
          {/* Back Button (< Kembali) */}
          <button
            type="button"
            onClick={handleBack}
            disabled={currentIndex === 0 && !isReviewing}
            className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-1.5 ${theme.btnSecondary}`}
          >
            <ChevronLeft className="h-4 w-4 shrink-0" />
            <span>Kembali</span>
          </button>

          {/* Next / Submit Button (Lanjut >) */}
          {!isReviewing ? (
            <button
              type="button"
              onClick={handleNext}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold shadow-sm focus:outline-none transition flex items-center justify-center gap-1.5 ${theme.btnPrimary}`}
            >
              <span>{currentIndex === formGraph.nodes.length - 1 ? "Tinjau" : "Lanjut"}</span>
              <ChevronRight className="h-4 w-4 shrink-0" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (typeof chrome !== "undefined" && chrome.tabs) {
                  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    const tabId = tabs[0]?.id;
                    if (tabId != null && formGraph) {
                      chrome.tabs.sendMessage(tabId, {
                        type: "SUBMIT_TARGET_FORM",
                        payload: { formId: formGraph.formId || formGraph.id },
                      });
                    }
                  });
                }
              }}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold shadow-md transition ${theme.btnPrimary}`}
            >
              Kirim Formulir di Web Asli
            </button>
          )}
        </div>

        {/* Tagline Footer */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium opacity-60 text-center">
          <Lock className="h-3 w-3 shrink-0" />
          <span>Privasi terjaga • Pengiriman melalui website asli</span>
        </div>
      </footer>
    </div>
  );
}

// Sub-component to render field input based on field type
function renderFieldInput({
  node,
  value,
  onChangeValue,
  highContrast,
  theme,
}: {
  node: FormNode;
  value: any;
  onChangeValue: (val: any) => void;
  highContrast?: boolean;
  theme?: any;
}) {
  const isSelect = node.fieldType === "select" && node.options && node.options.length > 0;
  const isTextarea = node.fieldType === "textarea";

  if (isSelect) {
    return (
      <select
        id={`field_${node.nodeId}`}
        value={value || ""}
        onChange={(e) => onChangeValue(e.target.value)}
        className={`w-full rounded-xl border px-3.5 py-3 text-sm font-medium transition focus:outline-none ${theme?.inputBg || "bg-white border-gray-300 text-gray-900"}`}
      >
        <option value="" disabled>
          -- Pilih salah satu --
        </option>
        {node.options?.map((opt, i) => (
          <option key={i} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  if (isTextarea) {
    return (
      <textarea
        id={`field_${node.nodeId}`}
        rows={3}
        value={value || ""}
        onChange={(e) => onChangeValue(e.target.value)}
        placeholder="Ketik jawaban Anda di sini..."
        className={`w-full rounded-xl border px-3.5 py-3 text-sm font-medium transition focus:outline-none ${theme?.inputBg || "bg-white border-gray-300 text-gray-900"}`}
      />
    );
  }

  return (
    <input
      id={`field_${node.nodeId}`}
      type={node.fieldType === "number" ? "number" : "text"}
      value={value || ""}
      onChange={(e) => onChangeValue(e.target.value)}
      placeholder="Ketik jawaban Anda..."
      className={`w-full rounded-xl border px-3.5 py-3 text-sm font-medium transition focus:outline-none ${theme?.inputBg || "bg-white border-gray-300 text-gray-900"}`}
    />
  );
}