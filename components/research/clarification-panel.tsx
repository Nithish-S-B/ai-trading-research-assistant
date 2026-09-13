import { Check, LoaderCircle, MessageCircleQuestion } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ClarificationQuestion } from "@/types/clarification";

type ClarificationPanelProps = {
  questions: ClarificationQuestion[];
  answers: Record<string, string>;
  isUpdating: boolean;
  onAnswerChange: (id: string, answer: string) => void;
  onUpdate: () => void;
};

export function ClarificationPanel({ questions, answers, isUpdating, onAnswerChange, onUpdate }: ClarificationPanelProps) {
  const hasUnansweredQuestion = questions.some((question) => !(answers[question.id] ?? "").trim());

  return (
    <Card aria-labelledby="clarification-panel-title">
      <CardHeader>
        <CardTitle id="clarification-panel-title" className="flex items-center gap-2">
          <MessageCircleQuestion aria-hidden="true" className="size-4 text-cyan-300" />
          A few details to make this testable
        </CardTitle>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          These are the smallest missing decisions needed to turn the idea into a clear experiment.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {questions.map((question) => {
          const answer = answers[question.id] ?? "";
          return (
            <div className="border-t border-slate-800/80 pt-5 first:border-0 first:pt-0" key={question.id}>
              <p className="text-sm font-medium leading-6 text-slate-100">{question.question}</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">{question.reason}</p>
              {question.options?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {question.options.map((option) => {
                    const selected = answer === option;
                    return (
                      <button aria-pressed={selected} className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${selected ? "border-cyan-300/60 bg-cyan-300/10 text-cyan-100" : "border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-600 hover:text-white"}`} key={option} onClick={() => onAnswerChange(question.id, option)} type="button">
                        {selected ? <Check aria-hidden="true" className="mr-1 inline size-3.5" /> : null}
                        {option}
                      </button>
                    );
                  })}
                </div>
              ) : null}
              {question.allowCustomAnswer ? (
                <input aria-label={`Answer: ${question.question}`} className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/15" onChange={(event) => onAnswerChange(question.id, event.target.value)} placeholder="Enter a custom answer" value={answer} />
              ) : null}
            </div>
          );
        })}
        <div className="flex justify-end border-t border-slate-800/80 pt-5">
          <Button disabled={hasUnansweredQuestion || isUpdating} onClick={onUpdate} type="button">
            {isUpdating ? <><LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> Updating...</> : "Update Experiment"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
