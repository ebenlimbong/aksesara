import { DetectionEvidence } from "@aksesara/form-schema";

export interface ResolvedLabel {
  label: string;
  confidence: number;
  evidence: DetectionEvidence[];
}

export function cleanLabelText(text: string): string {
  if (!text) return "";
  return text
    .replace(/[*:]/g, " ")
    .replace(/\(\s*wajib\s*\)/gi, "")
    .replace(/\(\s*required\s*\)/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeTechnicalLabel(text: string): string {
  if (!text) return "";

  const trimmed = text.trim();
  const lowerKey = trimmed.toLowerCase().replace(/\s+/g, "_");

  // Specific common Indonesian abbreviations & technical field names mapping
  const abbreviationsMap: Record<string, string> = {
    nik: "NIK",
    nip: "NIP",
    npwp: "NPWP",
    kk: "KK",
    rt: "RT",
    rw: "RW",
    hp: "Nomor HP",
    no_hp: "Nomor HP",
    nohp: "Nomor HP",
    no_telepon: "Nomor Telepon",
    tgl_lahir: "Tanggal Lahir",
    tanggal_lahir: "Tanggal Lahir",
    nama_lengkap: "Nama Lengkap",
    id_wil_provinsi: "Provinsi",
    id_provinsi: "Provinsi",
    id_wil_kabupaten: "Kabupaten/Kota",
    id_kabupaten: "Kabupaten/Kota",
    id_wil_kecamatan: "Kecamatan",
    id_kecamatan: "Kecamatan",
    id_wil_kelurahan: "Kelurahan/Desa",
    id_kelurahan: "Kelurahan/Desa",
  };

  if (abbreviationsMap[lowerKey]) {
    return abbreviationsMap[lowerKey];
  }

  // Strip technical prefix tokens like "id_wil_", "id_", "user_", "input_"
  let cleaned = trimmed
    .replace(/^id[_-]wil[_-]/i, "")
    .replace(/^id[_-]/i, "")
    .replace(/^user[_-]/i, "")
    .replace(/^input[_-]/i, "")
    .replace(/^field[_-]/i, "")
    .replace(/[-_]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim();

  if (!cleaned) cleaned = trimmed;

  // Title Case normalization
  cleaned = cleaned
    .split(/\s+/)
    .map((word) => {
      const wLower = word.toLowerCase();
      if (abbreviationsMap[wLower]) return abbreviationsMap[wLower];
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");

  return cleanLabelText(cleaned);
}

export function resolveFieldLabel(element: Element): ResolvedLabel {
  const evidence: DetectionEvidence[] = [];

  // 1. Verified Bridge metadata
  const bridgeLabel = element.getAttribute("data-aksesara-label") || element.getAttribute("data-aksesara-help");
  if (bridgeLabel) {
    const cleaned = cleanLabelText(bridgeLabel);
    if (cleaned) {
      evidence.push({ source: "bridge", score: 1.0, text: cleaned });
    }
  }

  // 2. <label for="id">
  if (element.id && typeof document !== "undefined") {
    try {
      const labelForEl = document.querySelector(`label[for="${CSS.escape(element.id)}"]`);
      if (labelForEl && labelForEl.textContent) {
        const cleaned = cleanLabelText(labelForEl.textContent);
        if (cleaned) {
          evidence.push({ source: "label-for", score: 0.95, text: cleaned });
        }
      }
    } catch {
      // Ignore invalid CSS escape
    }
  }

  // 3. Wrapping <label>
  const parentLabel = element.closest("label");
  if (parentLabel && parentLabel.textContent) {
    const cleaned = cleanLabelText(parentLabel.textContent);
    if (cleaned) {
      evidence.push({ source: "wrapping-label", score: 0.9, text: cleaned });
    }
  }

  // 4. aria-labelledby
  const ariaLabelledBy = element.getAttribute("aria-labelledby");
  if (ariaLabelledBy && typeof document !== "undefined") {
    try {
      const targetEl = document.getElementById(ariaLabelledBy);
      if (targetEl && targetEl.textContent) {
        const cleaned = cleanLabelText(targetEl.textContent);
        if (cleaned) {
          evidence.push({ source: "aria-labelledby", score: 0.85, text: cleaned });
        }
      }
    } catch {
      // Ignore
    }
  }

  // 5. aria-label
  const ariaLabel = element.getAttribute("aria-label");
  if (ariaLabel) {
    const cleaned = cleanLabelText(ariaLabel);
    if (cleaned) {
      evidence.push({ source: "aria-label", score: 0.8, text: cleaned });
    }
  }

  // 6. fieldset / legend
  const fieldset = element.closest("fieldset");
  if (fieldset) {
    const legend = fieldset.querySelector("legend");
    if (legend && legend.textContent) {
      const cleaned = cleanLabelText(legend.textContent);
      if (cleaned) {
        evidence.push({ source: "legend", score: 0.75, text: cleaned });
      }
    }
  }

  // 7. Nearby text
  const previousEl = element.previousElementSibling;
  if (previousEl && ["span", "p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "label"].includes(previousEl.tagName.toLowerCase())) {
    if (previousEl.textContent) {
      const cleaned = cleanLabelText(previousEl.textContent);
      if (cleaned && cleaned.length < 120) {
        evidence.push({ source: "nearby-text", score: 0.6, text: cleaned });
      }
    }
  }

  // 8. placeholder
  const placeholder = element.getAttribute("placeholder");
  if (placeholder) {
    const cleaned = cleanLabelText(placeholder);
    if (cleaned) {
      evidence.push({ source: "placeholder", score: 0.5, text: cleaned });
    }
  }

  // 9. Technical name or id fallback with semantic normalization
  const techName = element.getAttribute("name") || element.id;
  if (techName) {
    const normalized = normalizeTechnicalLabel(techName);
    if (normalized) {
      evidence.push({ source: "technical-name", score: 0.3, text: normalized });
    }
  }

  if (evidence.length === 0) {
    const defaultLabel = "Pertanyaan tanpa label";
    return {
      label: defaultLabel,
      confidence: 0.1,
      evidence: [{ source: "technical-name", score: 0.1, text: defaultLabel }],
    };
  }

  // Sort evidence by score descending and take the best candidate
  evidence.sort((a, b) => b.score - a.score);
  const bestEvidence = evidence[0];

  return {
    label: bestEvidence.text || "Pertanyaan tanpa label",
    confidence: bestEvidence.score,
    evidence,
  };
}
