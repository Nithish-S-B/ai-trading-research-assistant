import { GoogleGenAI } from "@google/genai";

import {
  clarificationJsonSchema,
  clarificationsSchema,
  type ValidatedClarificationQuestion,
} from "@/lib/clarification-schema";
import {
  StructureExperimentError,
} from "@/lib/ai/structure-experiment";
import type { ValidatedExperiment } from "@/lib/experiment-schema";

const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash-lite";
const GEMINI_TIMEOUT_MS = 120_000;

const systemInstruction = [
  "Generate the smallest useful set of clarification questions for a trading experiment.",
  "Output only an array matching the provided JSON schema. Ask only questions that resolve material ambiguity or missing information needed to test the idea.",
  "Do not ask about fields that are already explicit or safely inferred. Do not invent thresholds, exits, holding periods, or dates.",
  "Preserve ambiguous wording and ask for the specific detail needed to make it testable. For ambiguous terms such as sharp fall, ask the user to define the threshold but do not offer invented numeric percentage options; use an empty options array and allow a custom answer. Infer Daily for explicit consecutive down days and do not ask for that timeframe. Return an empty array when no clarification is materially needed. Never provide advice or commentary.",
].join("\n");

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

export async function generateClarifications(
  question: string,
  experiment: ValidatedExperiment,
): Promise<ValidatedClarificationQuestion[]> {
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
      contents: `${systemInstruction}\n\nOriginal research question:\n${question}\n\nCurrent validated experiment:\n${JSON.stringify(experiment)}`,
      config: {
        temperature: 0,
        maxOutputTokens: 700,
        responseMimeType: "application/json",
        responseSchema: clarificationJsonSchema,
      },
    });

    response = await Promise.race([request, createTimeout()]);
  } catch (error) {
    if (error instanceof StructureExperimentError) {
      throw error;
    }

    console.error("Gemini clarification generation failure", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw new StructureExperimentError(
      "provider_failure",
      "The Gemini provider returned an error.",
    );
  }

  if (!response.text || typeof response.text !== "string") {
    throw new StructureExperimentError(
      "invalid_model_output",
      "Gemini returned no clarification questions.",
    );
  }

  let modelOutput: unknown;

  try {
    modelOutput = JSON.parse(response.text);
  } catch {
    throw new StructureExperimentError(
      "invalid_model_output",
      "Gemini returned invalid clarification JSON.",
    );
  }

  const validated = clarificationsSchema.safeParse(modelOutput);

  if (!validated.success) {
    console.error("Gemini clarification output failed validation", {
      issues: validated.error.issues,
    });
    throw new StructureExperimentError(
      "invalid_model_output",
      "Gemini returned invalid clarification questions.",
    );
  }

  return validated.data;
}
