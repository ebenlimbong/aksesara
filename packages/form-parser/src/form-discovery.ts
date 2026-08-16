import { extractRawField, DiscoveredRawField } from "./field-extractor";

export interface DiscoveredForm {
  formId: string;
  formElement?: Element;
  action?: string;
  method?: string;
  fields: DiscoveredRawField[];
}

export function discoverForms(container: Document | Element): DiscoveredForm[] {
  const root = container.nodeType === Node.DOCUMENT_NODE
    ? (container as Document).body
    : (container as Element);

  if (!root) {
    return [];
  }

  const formElements = Array.from(root.querySelectorAll("form"));
  const discoveredForms: DiscoveredForm[] = [];
  const processedElements = new Set<Element>();

  // Process explicit <form> tags
  formElements.forEach((formEl, idx) => {
    const inputs = Array.from(formEl.querySelectorAll("input, textarea, select"));
    const fields: DiscoveredRawField[] = [];

    inputs.forEach((inputEl) => {
      processedElements.add(inputEl);
      const rawField = extractRawField(inputEl);
      if (rawField) {
        fields.push(rawField);
      }
    });

    if (fields.length > 0) {
      discoveredForms.push({
        formId: formEl.id || `form_${idx + 1}`,
        formElement: formEl,
        action: formEl.getAttribute("action") || undefined,
        method: formEl.getAttribute("method") || undefined,
        fields,
      });
    }
  });

  // Process loose inputs outside <form> tags
  const looseInputs = Array.from(root.querySelectorAll("input, textarea, select")).filter(
    (el) => !processedElements.has(el)
  );

  const looseFields: DiscoveredRawField[] = [];
  looseInputs.forEach((inputEl) => {
    const rawField = extractRawField(inputEl);
    if (rawField) {
      looseFields.push(rawField);
    }
  });

  if (looseFields.length > 0) {
    discoveredForms.push({
      formId: "form_loose_inputs",
      fields: looseFields,
    });
  }

  return discoveredForms;
}
