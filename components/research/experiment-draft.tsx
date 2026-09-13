import { AlertCircle, CheckCircle2, Clipboard, Check, LoaderCircle, RotateCcw, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Experiment, ExperimentField, FieldSource } from "@/types/experiment";

type ExperimentDraftProps = {
  copied: boolean;
  clarificationCount: number;
  error: string | null;
  experiment: Experiment | null;
  isLoading: boolean;
  isReady: boolean;
  onCopy: () => void;
  onStartNew: () => void;
  question: string;
};

const fieldDefinitions: Array<{ key: ExperimentField; label: string }> = [
  { key: "instrument", label: "Instrument" },
  { key: "timeframe", label: "Timeframe" },
  { key: "entryCondition", label: "Entry condition" },
  { key: "exitCondition", label: "Exit condition" },
  { key: "holdingPeriod", label: "Holding period" },
  { key: "filters", label: "Filters" },
  { key: "objective", label: "Research objective" },
];

const sourceStyles: Record<FieldSource, string> = {
  user: "border-slate-700 bg-slate-800/70 text-slate-300",
  clarified: "border-cyan-400/20 bg-cyan-400/10 text-cyan-200",
  inferred: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  missing: "border-slate-700/70 bg-slate-950/40 text-slate-500",
};

function FieldSourceBadge({ source }: { source: FieldSource }) {
  const label = source === "user" ? "User provided" : source === "clarified" ? "Clarified" : source === "inferred" ? "Inferred" : "Missing";

  return <Badge className={sourceStyles[source]}>{label}</Badge>;
}

function displayFieldValue(experiment: Experiment, field: ExperimentField, isReady: boolean) {
  if (field === "filters") {
    if (experiment.filters.length > 0) {
      return experiment.filters.join(", ");
    }

    return isReady ? "None" : null;
  }

  return experiment[field];
}

export function ExperimentDraft({
  copied,
  clarificationCount,
  error,
  experiment,
  isLoading,
  isReady,
  onCopy,
  onStartNew,
  question,
}: ExperimentDraftProps) {
  return (
    <Card aria-labelledby="experiment-draft-title">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle id="experiment-draft-title">{isReady ? "Experiment Ready" : "Experiment Draft"}</CardTitle>
          {isLoading ? (
            <Badge className="border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
              <LoaderCircle aria-hidden="true" className="mr-1 size-3 animate-spin" />
              In progress
            </Badge>
          ) : experiment && isReady ? (
            <Badge>
              <CheckCircle2 aria-hidden="true" className="mr-1 size-3" />
              Ready
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-start gap-3 rounded-xl border border-dashed border-cyan-400/20 bg-cyan-400/[0.04] px-4 py-5">
            <LoaderCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0 animate-spin text-cyan-300" />
            <div>
              <p className="text-sm font-medium text-slate-200">Structuring your experiment...</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Identifying the market, conditions, filters, and missing information.
              </p>
            </div>
          </div>
        ) : error && !experiment ? (
          <div className="flex items-start gap-3 rounded-xl border border-rose-400/20 bg-rose-400/[0.05] px-4 py-5 text-rose-200">
            <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="text-sm font-medium">Experiment could not be prepared</p>
              <p className="mt-1 text-sm leading-6 text-rose-200/70">
                Edit the question if needed, then submit it again to retry.
              </p>
            </div>
          </div>
        ) : experiment ? (
          <>
            {error ? (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-400/20 bg-rose-400/[0.05] px-4 py-4 text-rose-200" role="alert">
                <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                <p className="text-sm leading-6">{error}</p>
              </div>
            ) : null}
            <div className="mb-7 rounded-xl border border-slate-800/80 bg-slate-950/35 px-4 py-4">
              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">Research question</p>
                  <p className="mt-2 text-base leading-7 text-slate-100">{question}</p>
                </div>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:min-w-48">
                  <div>
                    <dt className="text-xs text-slate-500">Experiment status</dt>
                    <dd className="mt-1 font-medium text-cyan-200">{isReady ? "Ready" : "In progress"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Clarifications</dt>
                    <dd className="mt-1 font-medium text-slate-200">{clarificationCount} answered</dd>
                  </div>
                </dl>
              </div>
            </div>

            <dl className="divide-y divide-slate-800/80">
              {fieldDefinitions.map(({ key, label }) => {
                const value = displayFieldValue(experiment, key, isReady);
                const isOptionalReadyFilter = isReady && key === "filters" && experiment.filters.length === 0;

                return (
                  <div
                    className="grid gap-2 py-4 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)_auto] sm:items-start sm:gap-5"
                    key={key}
                  >
                    <dt className="text-sm text-slate-500">{label}</dt>
                    <dd className={value ? "text-sm leading-6 text-slate-200" : "text-sm italic leading-6 text-slate-500"}>
                      {value || "Not specified"}
                    </dd>
                    <div className="sm:justify-self-end">
                      {isOptionalReadyFilter ? null : <FieldSourceBadge source={experiment.sources[key]} />}
                    </div>
                  </div>
                );
              })}
            </dl>

            <div className="mt-8 border-t border-slate-800/80 pt-6">
              <p className="text-sm font-medium text-slate-200">{isReady && experiment.missingFields.length > 0 ? "Unresolved information" : "Missing information"}</p>
              {experiment.missingFields.length > 0 ? (
                <ul className="mt-3 space-y-2 text-sm text-slate-400">
                  {experiment.missingFields.map((field) => (
                    <li className="flex items-center gap-2" key={field}>
                      <span aria-hidden="true" className="size-1.5 rounded-full bg-cyan-300/70" />
                      {field}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  No additional core information was identified as missing.
                </p>
              )}
            </div>

            {isReady ? (
              <div className="mt-8 flex flex-col gap-3 border-t border-slate-800/80 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">Review the structured fields before using this experiment for analysis.</p>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <Button onClick={onCopy} size="sm" variant="secondary" type="button">
                    {copied ? <Check aria-hidden="true" className="size-3.5" /> : <Clipboard aria-hidden="true" className="size-3.5" />}
                    {copied ? "Copied" : "Copy Experiment"}
                  </Button>
                  <Button onClick={onStartNew} size="sm" variant="ghost" type="button">
                    <RotateCcw aria-hidden="true" className="size-3.5" />
                    Start New Research
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="flex items-start gap-3 rounded-xl border border-dashed border-cyan-400/20 bg-cyan-400/[0.04] px-4 py-5">
            <Sparkles aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-cyan-300" />
            <p className="text-sm leading-6 text-slate-500">
              Your structured experiment will appear here after analysis.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
