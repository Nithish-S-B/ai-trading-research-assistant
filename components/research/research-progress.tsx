import { Check } from "lucide-react";

export type ResearchStage = "ask" | "structure" | "clarify" | "ready";

type ResearchProgressProps = {
  currentStage: ResearchStage;
};

const stages: Array<{ id: ResearchStage; label: string }> = [
  { id: "ask", label: "Ask" },
  { id: "structure", label: "Structure" },
  { id: "clarify", label: "Clarify" },
  { id: "ready", label: "Ready" },
];

export function ResearchProgress({ currentStage }: ResearchProgressProps) {
  const currentIndex = stages.findIndex((stage) => stage.id === currentStage);

  return (
    <nav aria-label="Research progress" className="mb-8 overflow-x-auto">
      <ol className="mx-auto flex min-w-[20rem] max-w-2xl items-center justify-between gap-2">
        {stages.map((stage, index) => {
          const isCurrent = stage.id === currentStage;
          const isComplete = index < currentIndex;

          return (
            <li className="flex min-w-0 flex-1 items-center gap-2" key={stage.id}>
              <div className="flex min-w-0 items-center gap-2">
                <span
                  aria-current={isCurrent ? "step" : undefined}
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors ${
                    isCurrent
                      ? "border-cyan-300/70 bg-cyan-300/15 text-cyan-100"
                      : isComplete
                        ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-200"
                        : "border-slate-700 bg-slate-900/70 text-slate-500"
                  }`}
                >
                  {isComplete ? <Check aria-hidden="true" className="size-3.5" /> : index + 1}
                </span>
                <span className={`truncate text-xs font-medium sm:text-sm ${isCurrent ? "text-slate-100" : "text-slate-500"}`}>
                  {stage.label}
                </span>
              </div>
              {index < stages.length - 1 ? (
                <span aria-hidden="true" className={`h-px flex-1 ${isComplete ? "bg-cyan-400/30" : "bg-slate-800"}`} />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
