import { GoogleGenAI } from "@google/genai";

import {
  experimentJsonSchema,
  experimentSchema,
  type ValidatedExperiment,
} from "@/lib/experiment-schema";
import type { ValidatedClarificationQuestion } from "@/lib/clarification-schema";
import { StructureExperimentError } from "@/lib/ai/structure-experiment";

const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash-lite";
const GEMINI_TIMEOUT_MS = 120_000;

const systemInstruction = [
  "Update the current trading experiment using only the user's clarification answers.",
  "Output one Experiment JSON object matching the schema, with no advice, reasoning, markdown, or commentary.",
  "Preserve all existing supported values unless an answer explicitly changes them. Mark answer-derived fields as clarified, safely derived fields as inferred, and unresolved fields as missing.",
  "Do not invent thresholds, exits, holding periods, timeframes, or other values that are not explicit in the question, experiment, or answers. Keep missingFields accurate.",
  "Do not introduce information that does not exist in the current research question, current experiment, or user clarification answers. Never import values from examples, prior requests, or unrelated context; in particular, do not introduce filters or objectives that are absent from the current inputs.",
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

export async function applyClarifications(input: {
  question: string;
  experiment: ValidatedExperiment;
  clarifications: ValidatedClarificationQuestion[];
  answers: Record<string, string>;
}): Promise<ValidatedExperiment> {
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
      contents: `${systemInstruction}\n\nOriginal research question:\n${input.question}\n\nCurrent validated experiment:\n${JSON.stringify(input.experiment)}\n\nClarification questions:\n${JSON.stringify(input.clarifications)}\n\nUser answers by question id:\n${JSON.stringify(input.answers)}`,
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

    console.error("Gemini clarification application failure", {
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
      "Gemini returned no updated experiment.",
    );
  }

  let modelOutput: unknown;

  try {
    modelOutput = JSON.parse(response.text);
  } catch {
    throw new StructureExperimentError(
      "invalid_model_output",
      "Gemini returned invalid updated experiment JSON.",
    );
  }

  const validated = experimentSchema.safeParse(modelOutput);

  if (!validated.success) {
    console.error("Gemini updated experiment failed validation", {
      issues: validated.error.issues,
    });
    throw new StructureExperimentError(
      "invalid_model_output",
      "Gemini returned an invalid updated experiment.",
    );
  }

  return validated.data;
}
