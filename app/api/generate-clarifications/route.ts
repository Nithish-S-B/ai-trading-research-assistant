import { NextResponse } from "next/server";

import { clarificationRequestSchema } from "@/lib/clarification-schema";
import { generateClarifications } from "@/lib/ai/generate-clarifications";
import { StructureExperimentError } from "@/lib/ai/structure-experiment";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsedBody = clarificationRequestSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      { error: "Please provide a valid experiment and research question." },
      { status: 400 },
    );
  }

  try {
    const clarifications = await generateClarifications(
      parsedBody.data.question,
      parsedBody.data.experiment,
    );

    return NextResponse.json({ clarifications });
  } catch (error) {
    if (error instanceof StructureExperimentError) {
      console.error("Clarification generation request failed", { code: error.code });
      const status =
        error.code === "missing_api_key"
          ? 503
          : error.code === "provider_timeout"
            ? 504
            : 502;
      return NextResponse.json(
        { error: "Could not generate clarification questions. Please try again." },
        { status },
      );
    }

    console.error("Unexpected clarification generation failure", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Could not generate clarification questions. Please try again." },
      { status: 500 },
    );
  }
}
