import { FlaskConical } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
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

      <section aria-labelledby="research-question-title" className="mt-12 sm:mt-16">
        <Card>
          <CardHeader>
            <CardTitle id="research-question-title">Research Question</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-slate-700/80 bg-slate-950/35 px-6 text-center">
              <p className="text-sm leading-6 text-slate-500">
                Question input will be implemented in the next milestone.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
