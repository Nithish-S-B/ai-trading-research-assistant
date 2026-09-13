import { NextResponse } from "next/server";

import { structureQuestionSchema } from "@/lib/experiment-schema";
import {
  structureExperiment,
  StructureExperimentError,
} from "@/lib/ai/structure-experiment";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const parsedBody = structureQuestionSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      { error: "Please provide a valid research question." },
      { status: 400 },
    );
  }

  try {
    const experiment = await structureExperiment(parsedBody.data.question);

    return NextResponse.json({ experiment });
  } catch (error) {
    if (error instanceof StructureExperimentError) {
      console.error("Experiment structuring request failed", {
        code: error.code,
      });

      const status =
        error.code === "missing_api_key"
          ? 503
          : error.code === "provider_timeout"
            ? 504
            : 502;

      return NextResponse.json(
        { error: "Could not structure this experiment. Please try again." },
        { status },
      );
    }

    console.error("Unexpected experiment structuring failure", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      { error: "Could not structure this experiment. Please try again." },
      { status: 500 },
    );
  }
}
