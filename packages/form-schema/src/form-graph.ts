import { z } from "zod";

export const SupportedFieldTypeSchema = z.enum([
  "text",
  "email",
  "tel",
  "number",
  "date",
  "textarea",
  "radio",
  "checkbox",
  "select",
  "password",
  "file",
  "unknown"
]);

export type SupportedFieldType = z.infer<typeof SupportedFieldTypeSchema>;

export const DetectionEvidenceSourceSchema = z.enum([
  "bridge",
  "label-for",
  "wrapping-label",
  "aria-labelledby",
  "aria-label",
  "legend",
  "nearby-text",
  "placeholder",
  "technical-name"
]);

export type DetectionEvidenceSource = z.infer<typeof DetectionEvidenceSourceSchema>;

export const DetectionEvidenceSchema = z.object({
  source: DetectionEvidenceSourceSchema,
  score: z.number().min(0).max(1),
  text: z.string().optional()
});

export type DetectionEvidence = z.infer<typeof DetectionEvidenceSchema>;

export const SourceElementReferenceSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  xpath: z.string().optional(),
  cssSelector: z.string().optional(),
  selector: z.string().optional(),
  tagName: z.string().optional(),
  type: z.string().optional()
});

export type SourceElementReference = z.infer<typeof SourceElementReferenceSchema>;

export const FieldOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
  selected: z.boolean().optional(),
  disabled: z.boolean().optional()
});

export type FieldOption = z.infer<typeof FieldOptionSchema>;

export const FieldConstraintsSchema = z.object({
  required: z.boolean().default(false),
  min: z.number().optional(),
  max: z.number().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  pattern: z.string().optional(),
  step: z.number().optional(),
  accept: z.string().optional()
});

export type FieldConstraints = z.infer<typeof FieldConstraintsSchema>;

export const SensitivitySchema = z.enum([
  "normal",
  "identity",
  "financial",
  "health",
  "credential",
  "legal"
]);

export type Sensitivity = z.infer<typeof SensitivitySchema>;

export const FormNodeSchema = z.object({
  nodeId: z.string(),
  externalFieldId: z.string().optional(),
  source: SourceElementReferenceSchema,
  fieldType: SupportedFieldTypeSchema,
  officialLabel: z.string(),
  simpleLabel: z.string().optional(),
  helpText: z.string().optional(),
  example: z.string().optional(),
  currentValue: z.string().optional(),
  required: z.boolean().optional().default(false),
  options: z.array(FieldOptionSchema).optional(),
  constraints: FieldConstraintsSchema.optional(),
  sensitivity: SensitivitySchema.optional().default("normal"),
  confidence: z.number().min(0).max(1).optional().default(1),
  evidence: z.array(DetectionEvidenceSchema).optional(),
  supported: z.boolean().optional().default(true),
  unsupportedReason: z.string().optional()
});

export type FormNode = z.infer<typeof FormNodeSchema>;

export const FormSectionSchema = z.object({
  sectionId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  nodeIds: z.array(z.string())
});

export type FormSection = z.infer<typeof FormSectionSchema>;

export const FormModeSchema = z.enum(["universal", "annotated", "verified"]);

export const FormGraphSchema = z.object({
  id: z.string().optional(),
  formId: z.string().optional(),
  origin: z.string().optional(),
  title: z.string(),
  mode: FormModeSchema.optional().default("universal"),
  sections: z.array(FormSectionSchema).optional().default([]),
  nodes: z.array(FormNodeSchema),
  submitControl: SourceElementReferenceSchema.optional()
});

export type FormGraph = z.infer<typeof FormGraphSchema>;
