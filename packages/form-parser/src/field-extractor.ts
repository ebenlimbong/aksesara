import { DetectionEvidence, FieldConstraints, FieldOption, SourceElementReference, SupportedFieldType } from "@aksesara/form-schema";
import { generateCssSelector, generateXPath, isExcludedField } from "./dom-utils";
import { resolveFieldLabel } from "./label-resolver";

export interface DiscoveredRawField {
  nodeId: string;
  source: SourceElementReference;
  fieldType: SupportedFieldType;
  officialLabel: string;
  confidence: number;
  evidence: DetectionEvidence[];
  rawElement: Element;
  constraints: FieldConstraints;
  options?: FieldOption[];
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
}

export function extractRawField(element: Element): DiscoveredRawField | null {
  if (isExcludedField(element)) {
    return null;
  }

  const tagName = element.tagName.toLowerCase();
  let fieldType: SupportedFieldType = "unknown";

  if (tagName === "textarea") {
    fieldType = "textarea";
  } else if (tagName === "select") {
    fieldType = "select";
  } else if (tagName === "input") {
    const rawType = (element.getAttribute("type") || "text").toLowerCase();
    const supportedTypes: Record<string, SupportedFieldType> = {
      text: "text",
      email: "email",
      tel: "tel",
      number: "number",
      date: "date",
      radio: "radio",
      checkbox: "checkbox",
      password: "password",
      file: "file",
    };
    fieldType = supportedTypes[rawType] || "text";
  } else {
    return null;
  }

  const isRequired = element.hasAttribute("required") || element.getAttribute("aria-required") === "true";
  const minAttr = element.getAttribute("min");
  const maxAttr = element.getAttribute("max");
  const minLengthAttr = element.getAttribute("minlength");
  const maxLengthAttr = element.getAttribute("maxlength");
  const pattern = element.getAttribute("pattern") || undefined;
  const stepAttr = element.getAttribute("step");
  const accept = element.getAttribute("accept") || undefined;

  const constraints: FieldConstraints = {
    required: isRequired,
    min: minAttr ? parseFloat(minAttr) : undefined,
    max: maxAttr ? parseFloat(maxAttr) : undefined,
    minLength: minLengthAttr ? parseInt(minLengthAttr, 10) : undefined,
    maxLength: maxLengthAttr ? parseInt(maxLengthAttr, 10) : undefined,
    pattern,
    step: stepAttr ? parseFloat(stepAttr) : undefined,
    accept,
  };

  let options: FieldOption[] | undefined;
  if (tagName === "select") {
    const selectEl = element as HTMLSelectElement;
    options = Array.from(selectEl.options).map((opt) => ({
      label: opt.text.trim() || opt.value,
      value: opt.value,
      selected: opt.selected,
      disabled: opt.disabled,
    }));
  }

  const id = element.id || undefined;
  const name = element.getAttribute("name") || undefined;

  const source: SourceElementReference = {
    id,
    name,
    cssSelector: generateCssSelector(element),
    xpath: generateXPath(element),
    tagName,
    type: element.getAttribute("type") || undefined,
  };

  const nodeId = id ? `field_${id}` : name ? `field_${name}` : `field_${Math.random().toString(36).substring(2, 9)}`;

  const resolved = resolveFieldLabel(element);

  return {
    nodeId,
    source,
    fieldType,
    officialLabel: resolved.label,
    confidence: resolved.confidence,
    evidence: resolved.evidence,
    rawElement: element,
    constraints,
    options,
    ariaDescribedBy: element.getAttribute("aria-describedby") || undefined,
    ariaInvalid: element.getAttribute("aria-invalid") === "true",
  };
}
