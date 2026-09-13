import { z } from "zod";

const fieldSourceSchema = z.enum(["user", "inferred", "missing"]);

export const experimentSchema = z
  .object({
    instrument: z.string().nullable(),
    timeframe: z.string().nullable(),
    entryCondition: z.string().nullable(),
    exitCondition: z.string().nullable(),
    holdingPeriod: z.string().nullable(),
    filters: z.array(z.string()),
    objective: z.string().nullable(),
    missingFields: z.array(z.string()),
    sources: z
      .object({
        instrument: fieldSourceSchema,
        timeframe: fieldSourceSchema,
        entryCondition: fieldSourceSchema,
        exitCondition: fieldSourceSchema,
        holdingPeriod: fieldSourceSchema,
        filters: fieldSourceSchema,
        objective: fieldSourceSchema,
      })
      .strict(),
  })
  .strict();

export type ValidatedExperiment = z.infer<typeof experimentSchema>;

export const structureQuestionSchema = z
  .object({
    question: z
      .string()
      .trim()
      .min(1, "A research question is required.")
      .max(4000, "Research questions must be 4,000 characters or fewer.")
      .refine(
        (value) => !/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/u.test(value),
        "The research question contains unsupported control characters.",
      ),
  })
  .strict();

export const experimentJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    instrument: { type: ["string", "null"] },
    timeframe: { type: ["string", "null"] },
    entryCondition: { type: ["string", "null"] },
    exitCondition: { type: ["string", "null"] },
    holdingPeriod: { type: ["string", "null"] },
    filters: { type: "array", items: { type: "string" } },
    objective: { type: ["string", "null"] },
    missingFields: { type: "array", items: { type: "string" } },
    sources: {
      type: "object",
      additionalProperties: false,
      properties: {
        instrument: { type: "string", enum: ["user", "inferred", "missing"] },
        timeframe: { type: "string", enum: ["user", "inferred", "missing"] },
        entryCondition: { type: "string", enum: ["user", "inferred", "missing"] },
        exitCondition: { type: "string", enum: ["user", "inferred", "missing"] },
        holdingPeriod: { type: "string", enum: ["user", "inferred", "missing"] },
        filters: { type: "string", enum: ["user", "inferred", "missing"] },
        objective: { type: "string", enum: ["user", "inferred", "missing"] },
      },
      required: [
        "instrument",
        "timeframe",
        "entryCondition",
        "exitCondition",
        "holdingPeriod",
        "filters",
        "objective",
      ],
    },
  },
  required: [
    "instrument",
    "timeframe",
    "entryCondition",
    "exitCondition",
    "holdingPeriod",
    "filters",
    "objective",
    "missingFields",
    "sources",
  ],
} as const;
