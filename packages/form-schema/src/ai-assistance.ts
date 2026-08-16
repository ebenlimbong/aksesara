import { z } from "zod";
import { FieldConstraintsSchema, SensitivitySchema, SupportedFieldTypeSchema } from "./form-graph";

export const SanitizedFieldInputSchema = z.object({
  nodeId: z.string(),
  fieldType: SupportedFieldTypeSchema,
  officialLabel: z.string(),
  required: z.boolean(),
  constraints: FieldConstraintsSchema.optional(),
  sensitivity: SensitivitySchema,
  options: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  context: z.string().optional(),
  locale: z.string().default("id-ID")
});

export type SanitizedFieldInput = z.infer<typeof SanitizedFieldInputSchema>;

export const FieldAssistanceOutputSchema = z.object({
  nodeId: z.string(),
  simpleLabel: z.string().min(1).max(500),
  helpText: z.string().max(1000),
  exampleFormat: z.string().max(500),
  warnings: z.array(z.string().max(500)).max(5),
  confidence: z.number().min(0).max(1),
  source: z.enum(["gemini", "fallback"]).optional()
});

export type FieldAssistanceOutput = z.infer<typeof FieldAssistanceOutputSchema>;
