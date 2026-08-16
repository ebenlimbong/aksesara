import { FormGraph, FormGraphSchema, FormNode, FormSection, Sensitivity } from "@aksesara/form-schema";
import { DiscoveredForm } from "./form-discovery";
import { DiscoveredRawField } from "./field-extractor";

function detectSensitivity(rawField: DiscoveredRawField): Sensitivity {
  const text = `${rawField.officialLabel} ${rawField.source.name || ""} ${rawField.source.id || ""}`.toLowerCase();

  if (text.includes("password") || text.includes("pin") || text.includes("token")) {
    return "credential";
  }
  if (text.includes("nik") || text.includes("ktp") || text.includes("ssn") || text.includes("paspor") || text.includes("identity")) {
    return "identity";
  }
  if (text.includes("rekening") || text.includes("gaji") || text.includes("penghasilan") || text.includes("card") || text.includes("kredit") || text.includes("bank")) {
    return "financial";
  }
  if (text.includes("bpjs") || text.includes("medis") || text.includes("penyakit") || text.includes("kesehatan")) {
    return "health";
  }
  return "normal";
}

export function buildFormGraph(
  discoveredForm: DiscoveredForm,
  origin: string,
  pageTitle: string = "Formulir Web"
): FormGraph {
  const sectionsMap = new Map<string, { section: FormSection; fields: DiscoveredRawField[] }>();
  const defaultSectionId = "section_main";

  sectionsMap.set(defaultSectionId, {
    section: {
      sectionId: defaultSectionId,
      title: "Data Formulir Utama",
      description: "Isi data formulir berikut dengan teliti",
      nodeIds: [],
    },
    fields: [],
  });

  discoveredForm.fields.forEach((rawField) => {
    const fieldset = rawField.rawElement.closest("fieldset");
    let targetSectionId = defaultSectionId;

    if (fieldset) {
      const legend = fieldset.querySelector("legend");
      const legendText = legend?.textContent?.trim() || "Kelompok Data";
      const fieldsetId = fieldset.id || `section_${legendText.toLowerCase().replace(/\s+/g, "_")}`;

      if (!sectionsMap.has(fieldsetId)) {
        sectionsMap.set(fieldsetId, {
          section: {
            sectionId: fieldsetId,
            title: legendText,
            description: "Kelompok isian formulir",
            nodeIds: [],
          },
          fields: [],
        });
      }
      targetSectionId = fieldsetId;
    }

    const sectionEntry = sectionsMap.get(targetSectionId)!;
    sectionEntry.fields.push(rawField);
    sectionEntry.section.nodeIds.push(rawField.nodeId);
  });

  const sections: FormSection[] = [];
  const nodes: FormNode[] = [];

  sectionsMap.forEach(({ section, fields }) => {
    if (fields.length > 0) {
      sections.push(section);

      fields.forEach((rawField) => {
        const isSupported = rawField.fieldType !== "unknown";
        const node: FormNode = {
          nodeId: rawField.nodeId,
          source: rawField.source,
          fieldType: rawField.fieldType,
          officialLabel: rawField.officialLabel,
          simpleLabel: `Isi ${rawField.officialLabel.toLowerCase()}`,
          helpText: `Masukkan ${rawField.officialLabel} sesuai petunjuk formulir.`,
          example: rawField.fieldType === "number" ? "Contoh: 1000000" : "Contoh teks",
          required: rawField.constraints.required || false,
          options: rawField.options,
          constraints: rawField.constraints,
          sensitivity: detectSensitivity(rawField),
          confidence: rawField.confidence,
          evidence: rawField.evidence,
          supported: isSupported,
          unsupportedReason: isSupported ? undefined : "Tipe elemen formulir tidak didukung",
        };
        nodes.push(node);
      });
    }
  });

  const formGraph: FormGraph = {
    id: discoveredForm.formId || `form_${Date.now()}`,
    origin,
    title: pageTitle,
    mode: "universal",
    sections,
    nodes,
  };

  // Validate output against Zod FormGraphSchema
  return FormGraphSchema.parse(formGraph);
}
