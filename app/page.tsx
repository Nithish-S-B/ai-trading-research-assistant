"use client";

import { useRef, useState } from "react";
import { FlaskConical } from "lucide-react";

import type { ClarificationQuestion } from "@/types/clarification";
import type { Experiment } from "@/types/experiment";
import { ClarificationPanel } from "@/components/research/clarification-panel";
import { ExampleQuestions } from "@/components/research/example-questions";
import { ExperimentDraft } from "@/components/research/experiment-draft";
import { ResearchQuestionForm } from "@/components/research/research-question-form";

type FlowState = "idle" | "structuring" | "clarifying" | "updating" | "ready" | "error";
type ExperimentResponse = { experiment?: Experiment; error?: string };
type ClarificationResponse = { clarifications?: ClarificationQuestion[]; error?: string };

export default function HomePage() {
  const [question, setQuestion] = useState("");
  const [submittedQuestion, setSubmittedQuestion] = useState<string | null>(null);
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [clarifications, setClarifications] = useState<ClarificationQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [clarificationCycle, setClarificationCycle] = useState(0);
  const [flowState, setFlowState] = useState<FlowState>("idle");
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const isBusy = flowState === "structuring" || flowState === "updating";

  async function fetchClarifications(originalQuestion: string, currentExperiment: Experiment, currentRequestId: number, cycle: number) {
    const response = await fetch("/api/generate-clarifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: originalQuestion, experiment: currentExperiment }),
    });
    const payload = (await response.json()) as ClarificationResponse;
    if (!response.ok || !payload.clarifications) throw new Error(payload.error || "Clarification generation failed.");
    if (requestId.current !== currentRequestId) return;
    setClarifications(payload.clarifications);
    setAnswers((previous) => Object.fromEntries(payload.clarifications!.map((item) => [item.id, previous[item.id] ?? ""])));
    setFlowState(payload.clarifications.length === 0 || cycle >= 2 ? "ready" : "clarifying");
  }

  async function handleSubmit() {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isBusy) return;
    const currentRequestId = ++requestId.current;
    setQuestion(trimmedQuestion);
    setSubmittedQuestion(trimmedQuestion);
    setExperiment(null);
    setClarifications([]);
    setAnswers({});
    setClarificationCycle(0);
    setError(null);
    setFlowState("structuring");

    try {
      const response = await fetch("/api/structure-experiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmedQuestion }),
      });
      const payload = (await response.json()) as ExperimentResponse;
      if (!response.ok || !payload.experiment) throw new Error(payload.error || "Experiment structuring failed.");
      if (requestId.current !== currentRequestId) return;
      setExperiment(payload.experiment);
      await fetchClarifications(trimmedQuestion, payload.experiment, currentRequestId, 0);
    } catch {
      if (requestId.current === currentRequestId) {
        setError("Could not prepare clarification questions. Please try again.");
        setFlowState("error");
      }
    }
  }

  async function handleUpdate() {
    if (!submittedQuestion || !experiment || flowState === "updating") return;
    const currentAnswers = Object.fromEntries(clarifications.map((item) => [item.id, (answers[item.id] ?? "").trim()]));
    if (Object.values(currentAnswers).some((answer) => !answer)) {
      setError("Please answer each clarification before updating.");
      return;
    }
    const currentRequestId = requestId.current;
    setError(null);
    setFlowState("updating");

    try {
      const response = await fetch("/api/apply-clarifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: submittedQuestion, experiment, clarifications, answers: currentAnswers }),
      });
      const payload = (await response.json()) as ExperimentResponse;
      if (!response.ok || !payload.experiment) throw new Error(payload.error || "Experiment update failed.");
      if (requestId.current !== currentRequestId) return;
      const nextCycle = clarificationCycle + 1;
      setExperiment(payload.experiment);
      setClarificationCycle(nextCycle);
      if (nextCycle >= 2) {
        setClarifications([]);
        setFlowState("ready");
      } else {
        await fetchClarifications(submittedQuestion, payload.experiment, currentRequestId, nextCycle);
      }
    } catch {
      if (requestId.current === currentRequestId) {
        setError("Could not update this experiment. Your answers are still here; please try again.");
        setFlowState("error");
      }
    }
  }

  function handleClear() {
    requestId.current += 1;
    setQuestion("");
    setSubmittedQuestion(null);
    setExperiment(null);
    setClarifications([]);
    setAnswers({});
    setClarificationCycle(0);
    setError(null);
    setFlowState("idle");
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-16 sm:px-8 sm:py-24 lg:px-10">
      <section aria-labelledby="page-title" className="max-w-3xl">
        <div className="mb-6 flex size-11 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300"><FlaskConical aria-hidden="true" className="size-5" strokeWidth={1.8} /></div>
        <p className="mb-3 text-sm font-medium tracking-wide text-cyan-300">Research workspace</p>
        <h1 id="page-title" className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">Turn market ideas into testable experiments</h1>
        <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">Describe a trading idea in plain English. ResearchLab helps structure it into a clear experiment before testing.</p>
      </section>
      <div className="mt-12 space-y-10 sm:mt-16 sm:space-y-12">
        <ResearchQuestionForm hasSubmittedQuestion={submittedQuestion !== null} isLoading={isBusy} error={error} onClear={handleClear} onQuestionChange={setQuestion} onSubmit={handleSubmit} question={question} />
        <ExampleQuestions onSelect={setQuestion} />
        {submittedQuestion ? (
          <>
            <ExperimentDraft error={error} experiment={experiment} isLoading={flowState === "structuring"} question={submittedQuestion} />
            {experiment && clarifications.length > 0 && flowState !== "structuring" ? (
              <ClarificationPanel answers={answers} isUpdating={flowState === "updating"} onAnswerChange={(id, answer) => { setAnswers((previous) => ({ ...previous, [id]: answer })); setError(null); }} onUpdate={handleUpdate} questions={clarifications} />
            ) : null}
          </>
        ) : null}
      </div>
    </main>
  );
}
