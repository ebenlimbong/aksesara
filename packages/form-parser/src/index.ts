import { FormGraph } from "@aksesara/form-schema";
import { discoverForms, DiscoveredForm } from "./form-discovery";
import { buildFormGraph } from "./form-graph-builder";
import { resolveFieldLabel } from "./label-resolver";

export * from "./dom-utils";
export * from "./field-extractor";
export * from "./label-resolver";
export { discoverForms, buildFormGraph };
export type { DiscoveredForm };

export function classifySensitivity(fieldId: string, label: string): string {
  const lower = `${fieldId} ${label}`.toLowerCase();
  if (/gaji|income|penghasilan|rekening|gaji_orang_tua/i.test(lower)) return 'financial';
  if (/nim|nik|ktp|kk|nomor_induk/i.test(lower)) return 'identity';
  if (/password|sandi|pin/i.test(lower)) return 'credential';
  return 'normal';
}

export function resolveLabel(element: Element) {
  return resolveFieldLabel(element);
}

export function createEmptyFormGraph(origin: string, title: string = "Formulir Web"): FormGraph {
  return {
    id: `form_${Date.now()}`,
    origin,
    title,
    mode: "universal",
    sections: [],
    nodes: []
  };
}
