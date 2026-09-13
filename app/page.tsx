"use client";

import { useRef, useState } from "react";
import { FlaskConical } from "lucide-react";

import type { Experiment } from "@/types/experiment";
import { ExampleQuestions } from "@/components/research/example-questions";
import { ExperimentDraft } from "@/components/research/experiment-draft";
import { ResearchQuestionForm } from "@/components/research/research-question-form";

export default function HomePage() {
  const [question, setQuestion] = useState("");
  const [submittedQuestion, setSubmittedQuestion] = useState<string | null>(null);
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  async function handleSubmit() {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || isLoading) {
      return;
    }

    const currentRequestId = ++requestId.current;
    setQuestion(trimmedQuestion);
    setSubmittedQuestion(trimmedQuestion);
    setExperiment(null);
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/structure-experiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmedQuestion }),
      });
      const payload = (await response.json()) as {
        experiment?: Experiment;
        error?: string;
      };

      if (!response.ok || !payload.experiment) {
        throw new Error(payload.error || "Experiment structuring failed.");
      }

      if (requestId.current === currentRequestId) {
        setExperiment(payload.experiment);
      }
    } catch {
      if (requestId.current === currentRequestId) {
        setError("Could not structure this experiment. Please try again.");
      }
    } finally {
      if (requestId.current === currentRequestId) {
        setIsLoading(false);
      }
    }
  }

  function handleClear() {
    requestId.current += 1;
    setQuestion("");
    setSubmittedQuestion(null);
    setExperiment(null);
    setError(null);
    setIsLoading(false);
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-16 sm:px-8 sm:py-24 lg:px-10">
      <section aria-labelledby="page-title" className="max-w-3xl">
        <div className="mb-6 flex size-11 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
          <FlaskConical aria-hidden="true" className="size-5" strokeWidth={1.8} />
        </div>
        <p className="mb-3 text-sm font-medium tracking-wide text-cyan-300">
          Research workspace
        </p>
        <h1
          id="page-title"
          className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl"
        >
          Turn market ideas into testable experiments
        </h1>
        <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
          Describe a trading idea in plain English. ResearchLab helps structure it
          into a clear experiment before testing.
        </p>
      </section>

      <div className="mt-12 space-y-10 sm:mt-16 sm:space-y-12">
        <ResearchQuestionForm
          hasSubmittedQuestion={submittedQuestion !== null}
          isLoading={isLoading}
          error={error}
          onClear={handleClear}
          onQuestionChange={setQuestion}
          onSubmit={handleSubmit}
          question={question}
        />
        <ExampleQuestions onSelect={setQuestion} />
        {submittedQuestion ? (
          <ExperimentDraft
            error={error}
            experiment={experiment}
            isLoading={isLoading}
            question={submittedQuestion}
          />
        ) : null}
      </div>
    </main>
  );
}
