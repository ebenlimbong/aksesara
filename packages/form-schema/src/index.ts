import { z } from 'zod';

export type SupportedFieldType =
  | 'text'
  | 'email'
  | 'tel'
  | 'number'
  | 'date'
  | 'password'
  | 'textarea'
  | 'radio'
  | 'checkbox'
  | 'select'
  | 'unsupported';

export type FieldSensitivity =
  | 'normal'
  | 'identity'
  | 'financial'
  | 'health'
  | 'credential'
  | 'legal';

export type EvidenceSource =
  | 'bridge'
  | 'label-for'
  | 'wrapping-label'
  | 'aria-labelledby'
  | 'aria-label'
  | 'legend'
  | 'nearby-text'
  | 'placeholder'
  | 'technical-name';

export interface DetectionEvidence {
  source: EvidenceSource;
  score: number;
  text?: string;
}

export interface FieldOption {
  label: string;
  value: string;
  selected?: boolean;
}

export interface FieldConstraints {
  min?: number | string;
  max?: number | string;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  accept?: string;
}

export interface SourceElementReference {
  selector: string;
  xpath?: string;
  name?: string;
  id?: string;
}

export interface FormNode {
  nodeId: string;
  externalFieldId?: string;
  source: SourceElementReference;
  fieldType: SupportedFieldType;
  officialLabel: string;
  simpleLabel?: string;
  helpText?: string;
  example?: string;
  required: boolean;
  options?: FieldOption[];
  constraints: FieldConstraints;
  sensitivity: FieldSensitivity;
  confidence: number;
  evidence: DetectionEvidence[];
  supported: boolean;
  unsupportedReason?: string;
  currentValue?: string | boolean | string[];
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  nodeIds: string[];
}

export interface FormGraph {
  formId: string;
  externalFormId?: string;
  origin: string;
  title: string;
  mode: 'universal' | 'annotated' | 'verified';
  sections: FormSection[];
  nodes: FormNode[];
  submitControl?: SourceElementReference;
  detectedAt: string;
}

// Zod schema for AI Sanitized Field Input
export const SanitizedFieldInputSchema = z.object({
  nodeId: z.string(),
  fieldType: z.string(),
  officialLabel: z.string().min(1).max(500),
  instruction: z.string().max(500).optional().default(''),
  helpText: z.string().max(500).optional().default(''),
  example: z.string().max(500).optional().default(''),
  required: z.boolean().default(false),
  constraints: z
    .object({
      min: z.union([z.number(), z.string()]).optional(),
      max: z.union([z.number(), z.string()]).optional(),
      minLength: z.number().optional(),
      maxLength: z.number().optional(),
      pattern: z.string().optional(),
    })
    .optional()
    .default({}),
  sensitivity: z
    .enum(['normal', 'identity', 'financial', 'health', 'credential', 'legal'])
    .default('normal'),
});

export type SanitizedFieldInput = z.infer<typeof SanitizedFieldInputSchema>;

// Zod schema for AI Field Assistance Request
export const AssistFieldsRequestSchema = z.object({
  locale: z.string().default('id-ID'),
  formContext: z.string().optional().default(''),
  fields: z.array(SanitizedFieldInputSchema).min(1).max(50),
});

export type AssistFieldsRequest = z.infer<typeof AssistFieldsRequestSchema>;

// Zod schema for AI Field Assistance Output
export const FieldAssistanceOutputSchema = z.object({
  nodeId: z.string(),
  simpleLabel: z.string().min(1).max(240),
  helpText: z.string().max(600).default(''),
  exampleFormat: z.string().max(240).default(''),
  warnings: z.array(z.string().max(240)).max(5).default([]),
  confidence: z.number().min(0).max(1).default(0.9),
  verificationStatus: z.enum(['unverified-ai', 'verified']).default('unverified-ai'),
});

export type FieldAssistanceOutput = z.infer<typeof FieldAssistanceOutputSchema>;

export const AssistFieldsResponseSchema = z.object({
  fields: z.array(FieldAssistanceOutputSchema),
});

export type AssistFieldsResponse = z.infer<typeof AssistFieldsResponseSchema>;
