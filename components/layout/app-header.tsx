import { FlaskConical, Moon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/40">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
            <FlaskConical aria-hidden="true" className="size-[18px]" strokeWidth={1.8} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-slate-100">
                ResearchLab
              </span>
              <Badge>Prototype</Badge>
            </div>
            <p className="truncate text-xs text-slate-500">
              AI Trading Research Assistant
            </p>
          </div>
        </div>

        <Button
          aria-label="Theme toggle coming soon"
          disabled
          size="icon"
          title="Theme toggle coming soon"
          variant="ghost"
        >
          <Moon aria-hidden="true" className="size-4" />
        </Button>
      </div>
    </header>
  );
}
