import { NextResponse } from "next/server";

import { applyClarificationRequestSchema } from "@/lib/clarification-schema";
import { applyClarifications } from "@/lib/ai/apply-clarifications";
import { StructureExperimentError } from "@/lib/ai/structure-experiment";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsedBody = applyClarificationRequestSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      { error: "Please provide valid clarification answers." },
      { status: 400 },
    );
  }

  try {
    const experiment = await applyClarifications(parsedBody.data);
    return NextResponse.json({ experiment });
  } catch (error) {
    if (error instanceof StructureExperimentError) {
      console.error("Clarification application request failed", { code: error.code });
      const status =
        error.code === "missing_api_key"
          ? 503
          : error.code === "provider_timeout"
            ? 504
            : 502;
      return NextResponse.json(
        { error: "Could not update this experiment. Please try again." },
        { status },
      );
    }

    console.error("Unexpected clarification application failure", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Could not update this experiment. Please try again." },
      { status: 500 },
    );
  }
}
