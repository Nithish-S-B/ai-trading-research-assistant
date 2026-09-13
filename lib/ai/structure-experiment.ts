import { GoogleGenAI } from "@google/genai";

import {
  experimentJsonSchema,
  experimentSchema,
  type ValidatedExperiment,
} from "@/lib/experiment-schema";

const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash-lite";
const GEMINI_TIMEOUT_MS = 120_000;

const systemInstruction = [
  "Convert the user's trading research question into one Experiment JSON object. Output only schema-matching data, with no advice, predictions, reasoning, markdown, or commentary.",
  "Do not invent important values. Use null for absent scalar fields and list important absences in missingFields. Preserve ambiguous wording such as sharp fall; never invent a numeric threshold. Use filters for explicit constraints such as volatility. Mark each source as user, inferred, or missing.",
].join("\n");

export type StructureExperimentErrorCode =
  | "missing_api_key"
  | "provider_failure"
  | "provider_timeout"
  | "invalid_model_output";

export class StructureExperimentError extends Error {
  constructor(
    public readonly code: StructureExperimentErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "StructureExperimentError";
  }
}

function createTimeout() {
  return new Promise<never>((_, reject) => {
    setTimeout(
      () =>
        reject(
          new StructureExperimentError(
            "provider_timeout",
            "The Gemini provider timed out.",
          ),
        ),
      GEMINI_TIMEOUT_MS,
    );
  });
}

export async function structureExperiment(
  question: string,
): Promise<ValidatedExperiment> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new StructureExperimentError(
      "missing_api_key",
      "GEMINI_API_KEY is not configured.",
    );
  }

  const client = new GoogleGenAI({ apiKey });
  let response: Awaited<ReturnType<typeof client.models.generateContent>>;

  try {
    const request = client.models.generateContent({
      model: process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL,
      contents: `${systemInstruction}\n\nResearch question:\n${question}`,
      config: {
        temperature: 0,
        maxOutputTokens: 700,
        responseMimeType: "application/json",
        responseSchema: experimentJsonSchema,
      },
    });

    response = await Promise.race([request, createTimeout()]);
  } catch (error) {
    if (error instanceof StructureExperimentError) {
      throw error;
    }

    console.error("Gemini experiment structuring failure", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw new StructureExperimentError(
      "provider_failure",
      "The Gemini provider returned an error.",
    );
  }

  const content = response.text;

  if (!content || typeof content !== "string") {
    throw new StructureExperimentError(
      "invalid_model_output",
      "Gemini returned no structured experiment.",
    );
  }

  let modelOutput: unknown;

  try {
    modelOutput = JSON.parse(content);
  } catch {
    throw new StructureExperimentError(
      "invalid_model_output",
      "Gemini returned invalid structured JSON.",
    );
  }

  const validatedExperiment = experimentSchema.safeParse(modelOutput);

  if (!validatedExperiment.success) {
    console.error("Gemini experiment output failed validation", {
      issues: validatedExperiment.error.issues,
    });
    throw new StructureExperimentError(
      "invalid_model_output",
      "Gemini returned a structured experiment that failed validation.",
    );
  }

  return validatedExperiment.data;
}
