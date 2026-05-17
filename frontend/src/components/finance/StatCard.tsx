import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  delta?: number;
  icon: LucideIcon;
  accent?: "primary" | "accent" | "info" | "warning";
  hint?: string;
}

const accentMap = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent",
  info: "bg-info/10 text-info",
  warning: "bg-warning/15 text-warning",
};

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  accent = "primary",
  hint,
}: StatCardProps) {
  const positive = (delta ?? 0) >= 0;
  return (
    <div className="glass rounded-2xl p-5 shadow-card animate-fade-up">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            {label}
          </div>
          <div className="mt-2 text-2xl md:text-[28px] font-semibold tracking-tight font-display">
            {value}
          </div>
        </div>
        <div className={cn("h-10 w-10 rounded-xl grid place-items-center", accentMap[accent])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs">
        {typeof delta === "number" ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 font-medium",
              positive ? "text-success" : "text-destructive"
            )}
          >
            {positive ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {Math.abs(delta).toFixed(1)}%
          </span>
        ) : (
          <span />
        )}
        {hint && <span className="text-muted-foreground">{hint}</span>}
      </div>
    </div>
  );
}
