import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = {
  default:
    "bg-cyan-400 text-slate-950 hover:bg-cyan-300 focus-visible:ring-cyan-300/50",
  outline:
    "border border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800/70 focus-visible:ring-slate-500/50",
  secondary:
    "border border-slate-700 bg-slate-800/70 text-slate-200 hover:bg-slate-700/80 focus-visible:ring-slate-500/50",
  ghost:
    "text-slate-400 hover:bg-slate-800/70 hover:text-slate-200 focus-visible:ring-slate-500/50",
} as const;

const buttonSizes = {
  default: "h-10 px-4 py-2",
  sm: "h-8 rounded-md px-3 text-xs",
  icon: "size-9",
} as const;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
};

export function Button({
  className,
  size = "default",
  type = "button",
  variant = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-45",
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      type={type}
      {...props}
    />
  );
}
