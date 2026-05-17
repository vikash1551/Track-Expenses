import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Topbar } from "@/components/layout/Topbar";
import { insightService } from "@/services/insight.service";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Lightbulb, PiggyBank, ShieldAlert, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/ai-insights")({
  head: () => ({ meta: [{ title: "AI Insights — Track Expense" }] }),
  component: InsightsPage,
});

const KIND_META = {
  summary: { icon: FileText, color: "text-info bg-info/10" },
  tip: { icon: Lightbulb, color: "text-accent bg-accent/10" },
  savings: { icon: PiggyBank, color: "text-success bg-success/10" },
  alert: { icon: ShieldAlert, color: "text-destructive bg-destructive/10" },
} as const;

function InsightsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["insights"],
    queryFn: insightService.list,
  });

  const { data: expenses } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const { expenseService } = await import("@/services/expense.service");
      return expenseService.list();
    },
  });

  const expenseList = expenses ?? [];
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyExpenses = expenseList.filter(
    (e) => new Date(e.date) >= monthStart
  );
  const categories = new Set(monthlyExpenses.map((e) => e.category));

  return (
    <div>
      <Topbar title="AI Insights" subtitle="Smart analysis tuned to your spending DNA" />
      <div className="px-6 lg:px-8 py-6 space-y-6">
        <div className="glass rounded-2xl p-6 shadow-card relative overflow-hidden">
          <div
            className="absolute -top-20 -right-10 h-72 w-72 rounded-full opacity-25 blur-3xl"
            style={{ background: "var(--gradient-brand)" }}
          />
          <div className="relative flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-brand grid place-items-center shadow-glow shrink-0">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold font-display">
                Your monthly AI report is ready
              </h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                {monthlyExpenses.length > 0
                  ? `We analyzed ${monthlyExpenses.length} transaction${monthlyExpenses.length !== 1 ? "s" : ""} across ${categories.size} categor${categories.size !== 1 ? "ies" : "y"} this month. Here are the patterns, opportunities, and risks that matter most.`
                  : "Add some expenses to get personalized AI insights and recommendations."}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-2xl" />
              ))
            : (data ?? []).map((ins) => {
                const meta = KIND_META[ins.kind];
                const Icon = meta.icon;
                return (
                  <div
                    key={ins.id}
                    className="glass rounded-2xl p-5 shadow-card animate-fade-up"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "h-10 w-10 rounded-xl grid place-items-center shrink-0",
                          meta.color
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                          {ins.kind}
                        </div>
                        <h3 className="font-semibold mt-0.5">{ins.title}</h3>
                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                          {ins.body}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>
      </div>
    </div>
  );
}

