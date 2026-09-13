import { Lightbulb } from "lucide-react";

const exampleQuestions = [
  "Does buying NIFTY after a 1% fall have an edge?",
  "Does buying NIFTY after a 1% fall work better during high-volatility periods?",
  "Does BANKNIFTY tend to recover after two consecutive down days?",
] as const;

type ExampleQuestionsProps = {
  onSelect: (question: string) => void;
};

export function ExampleQuestions({ onSelect }: ExampleQuestionsProps) {
  return (
    <section aria-labelledby="example-questions-title">
      <div className="mb-4 flex items-center gap-2">
        <Lightbulb aria-hidden="true" className="size-4 text-cyan-300" />
        <h2 id="example-questions-title" className="text-sm font-medium text-slate-200">
          Try an example
        </h2>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {exampleQuestions.map((example) => (
          <button
            className="group rounded-xl border border-slate-800 bg-slate-900/30 px-4 py-4 text-left text-sm leading-6 text-slate-400 transition-colors hover:border-cyan-400/35 hover:bg-slate-900/70 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
            key={example}
            onClick={() => onSelect(example)}
            type="button"
          >
            <span className="text-cyan-300/70 transition-colors group-hover:text-cyan-300">“</span>
            {example}
          </button>
        ))}
      </div>
    </section>
  );
}
