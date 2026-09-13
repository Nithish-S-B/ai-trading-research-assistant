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
  "Generate the smallest useful set of clarification questions for a trading experiment. Prefer one focused question; never return more than two.",
  "Prioritize unresolved ambiguity in this order: entry condition, combined exit/holding logic, then timeframe only when it is materially necessary.",
  "Do not ask about fields that are already explicit or safely inferred. Do not invent thresholds, exits, holding periods, dates, indicators, stop-losses, take-profits, or trading strategies.",
  "Preserve ambiguous wording and ask the user to define it. For ambiguous terms such as sharp fall, ask what should count as a sharp fall, with no options and a free-text answer. Infer Daily for explicit one-day or consecutive-day language and do not ask for that timeframe. Return an empty array when no clarification is materially needed. Never provide advice or commentary.",
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

  return normalizeClarifications(validated.data, experiment);
}

function normalizeClarifications(
  questions: ValidatedClarificationQuestion[],
  experiment: ValidatedExperiment,
): ValidatedClarificationQuestion[] {
  const entryIsAmbiguous =
    experiment.sources.entryCondition === "user" &&
    /\b(sharp|significant|substantial|large|big)\s+(fall|drop)\b/i.test(
      experiment.entryCondition ?? "",
    );

  if (entryIsAmbiguous) {
    return [
      {
        id: "entry_condition_definition",
        field: "entryCondition",
        question: "What should count as a sharp fall?",
        reason: "The entry condition needs a measurable definition before the experiment can be tested.",
        options: [],
        allowCustomAnswer: true,
      },
    ];
  }

  const exitOrHoldingMissing =
    experiment.exitCondition === null || experiment.holdingPeriod === null;

  if (exitOrHoldingMissing) {
    return [
      {
        id: "exit_holding_logic",
        field: "exitCondition",
        question: "How should this trade be exited?",
        reason: "Specify a holding period or another clear exit rule so the experiment has a measurable outcome.",
        options: [],
        allowCustomAnswer: true,
      },
    ];
  }

  const priority: Record<string, number> = {
    entryCondition: 0,
    exitCondition: 1,
    holdingPeriod: 1,
    timeframe: 2,
  };

  return questions
    .sort((left, right) => (priority[left.field] ?? 3) - (priority[right.field] ?? 3))
    .slice(0, 2)
    .map((question) => ({ ...question, options: [] }));
}
