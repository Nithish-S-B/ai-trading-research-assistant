import { CheckCircle2, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ExperimentDraftProps = {
  question: string;
};

export function ExperimentDraft({ question }: ExperimentDraftProps) {
  return (
    <Card aria-labelledby="experiment-draft-title">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle id="experiment-draft-title">Experiment Draft</CardTitle>
          <Badge>
            <CheckCircle2 aria-hidden="true" className="mr-1 size-3" />
            Ready for analysis
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
            Research question
          </p>
          <p className="text-base leading-7 text-slate-100">{question}</p>
        </div>

        <div className="mt-7 flex items-start gap-3 rounded-xl border border-dashed border-cyan-400/20 bg-cyan-400/[0.04] px-4 py-4">
          <Sparkles aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-cyan-300" />
          <div>
            <p className="text-sm font-medium text-slate-200">Preparing experiment</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              AI experiment structuring will be added in the next milestone.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
