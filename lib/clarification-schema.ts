import { z } from "zod";

import { experimentSchema } from "@/lib/experiment-schema";

export const clarificationQuestionSchema = z
  .object({
    id: z.string().trim().min(1).max(80),
    field: z.string().trim().min(1).max(80),
    question: z.string().trim().min(1).max(500),
    reason: z.string().trim().min(1).max(500),
    options: z.array(z.string().trim().min(1).max(120)).max(6).optional(),
    allowCustomAnswer: z.boolean(),
  })
  .strict();

export const clarificationsSchema = z.array(clarificationQuestionSchema).max(5);

export const clarificationRequestSchema = z
  .object({
    question: z.string().trim().min(1).max(4000),
    experiment: experimentSchema,
  })
  .strict();

export const applyClarificationRequestSchema = z
  .object({
    question: z.string().trim().min(1).max(4000),
    experiment: experimentSchema,
    clarifications: clarificationsSchema,
    answers: z.record(z.string(), z.string().trim().min(1).max(500)),
  })
  .strict();

export const clarificationJsonSchema = {
  type: "array",
  items: {
    type: "object",
    additionalProperties: false,
    properties: {
      id: { type: "string" },
      field: { type: "string" },
      question: { type: "string" },
      reason: { type: "string" },
      options: { type: "array", items: { type: "string" } },
      allowCustomAnswer: { type: "boolean" },
    },
    required: ["id", "field", "question", "reason", "options", "allowCustomAnswer"],
  },
} as const;

export type ValidatedClarificationQuestion = z.infer<typeof clarificationQuestionSchema>;
