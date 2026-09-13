import { AlertCircle, ArrowRight, LoaderCircle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ResearchQuestionFormProps = {
  hasSubmittedQuestion: boolean;
  isLoading: boolean;
  error: string | null;
  onClear: () => void;
  onQuestionChange: (question: string) => void;
  onSubmit: () => void;
  question: string;
};

export function ResearchQuestionForm({
  hasSubmittedQuestion,
  isLoading,
  error,
  onClear,
  onQuestionChange,
  onSubmit,
  question,
}: ResearchQuestionFormProps) {
  const isBlank = question.trim().length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle id="research-question-title">Research Question</CardTitle>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Describe the market behaviour or trading idea you want to investigate.
        </p>
      </CardHeader>
      <CardContent>
        <form
          aria-label="Research question form"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <label
            className="mb-2 block text-sm font-medium text-slate-200"
            htmlFor="research-question"
          >
            What would you like to investigate?
          </label>
          <textarea
            aria-describedby="research-question-hint"
            className="min-h-40 w-full resize-none rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3.5 text-sm leading-6 text-slate-100 outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/15"
            id="research-question"
            onChange={(event) => onQuestionChange(event.target.value)}
            placeholder="Does buying NIFTY after a 1% fall work better during high-volatility periods?"
            value={question}
          />

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p id="research-question-hint" className="text-xs leading-5 text-slate-500">
              Be specific when possible, but incomplete ideas are okay.
            </p>
            <div className="flex items-center gap-3 sm:shrink-0">
              {hasSubmittedQuestion ? (
                <Button onClick={onClear} size="sm" variant="ghost">
                  <RotateCcw aria-hidden="true" className="size-3.5" />
                  Clear
                </Button>
              ) : null}
              <Button disabled={isBlank || isLoading} type="submit">
                {isLoading ? (
                  <>
                    <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                    Structuring...
                  </>
                ) : (
                  <>
                    Structure Experiment
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
          {error ? (
            <div
              aria-live="polite"
              className="mt-4 flex items-center gap-2 rounded-lg border border-rose-400/20 bg-rose-400/[0.05] px-3 py-2.5 text-sm text-rose-200"
              role="alert"
            >
              <AlertCircle aria-hidden="true" className="size-4 shrink-0" />
              {error}
            </div>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
