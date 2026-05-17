import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Wallet,
  TrendingDown,
  PiggyBank,
  IndianRupee,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Topbar } from "@/components/layout/Topbar";
import { StatCard } from "@/components/finance/StatCard";
import { expenseService } from "@/services/expense.service";
import { budgetService } from "@/services/budget.service";
import { insightService } from "@/services/insight.service";
import { fmtCurrency } from "@/utils/format";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Track Expense" }] }),
  component: Dashboard,
});

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--info)",
  "var(--warning)",
  "var(--destructive)",
];

function Dashboard() {
  const expenses = useQuery({ queryKey: ["expenses"], queryFn: expenseService.list });
  const budgets = useQuery({ queryKey: ["budgets"], queryFn: budgetService.list });
  const insights = useQuery({ queryKey: ["insights"], queryFn: insightService.list });

  const list = expenses.data ?? [];
  const total = list.reduce((s, e) => s + e.amount, 0);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthly = list.filter((e) => new Date(e.date) >= monthStart);
  const monthlyTotal = monthly.reduce((s, e) => s + e.amount, 0);

  // Calculate total budget from ALL budget categories
  const allBudgets = budgets.data ?? [];
  const totalBudgetLimit = allBudgets.reduce((s, b) => s + b.limit, 0);
  const remaining = totalBudgetLimit - monthlyTotal;
  const savings = Math.max(0, remaining * 0.7);

  // 30-day trend
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(now.getDate() - (29 - i));
    const key = d.toISOString().slice(0, 10);
    const sum = list
      .filter((e) => e.date.slice(0, 10) === key)
      .reduce((s, e) => s + e.amount, 0);
    return {
      date: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      amount: Math.round(sum * 100) / 100,
    };
  });

  // Pie chart: spending per category from actual expenses
  const catSpend: Record<string, number> = {};
  list.forEach((e) => {
    catSpend[e.category] = (catSpend[e.category] ?? 0) + e.amount;
  });
  const byCategory = Object.entries(catSpend)
    .map(([name, value]) => ({ name, value: Math.round(value) }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <div>
      <Topbar title="Overview" subtitle="Your financial pulse for this month" />
      <div className="px-6 lg:px-8 py-6 space-y-6">
        {/* KPI grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {expenses.isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[132px] rounded-2xl" />
            ))
          ) : (
            <>
              <StatCard
                label="Total Expenses"
                value={fmtCurrency(total)}
                icon={IndianRupee}
                accent="primary"
                delta={-3.2}
                hint="vs last 60d"
              />
              <StatCard
                label="Monthly Spending"
                value={fmtCurrency(monthlyTotal)}
                icon={TrendingDown}
                accent="accent"
                delta={5.4}
                hint="this month"
              />
              <StatCard
                label="Remaining Budget"
                value={fmtCurrency(Math.max(0, remaining))}
                icon={Wallet}
                accent="info"
                hint={totalBudgetLimit > 0 ? `of ${fmtCurrency(totalBudgetLimit)}` : "no budget set"}
              />
              <StatCard
                label="Projected Savings"
                value={fmtCurrency(Math.max(0, savings))}
                icon={PiggyBank}
                accent="warning"
                delta={8.1}
                hint="at month end"
              />
            </>
          )}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 glass rounded-2xl p-5 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Spending trend</h3>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </div>
              <div className="text-xs text-muted-foreground">INR</div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={days} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    interval={4}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      color: "var(--popover-foreground)",
                      fontSize: 12,
                    }}
                    formatter={(v: any) => fmtCurrency(Number(v))}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    fill="url(#fillSpend)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass rounded-2xl p-5 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">By category</h3>
                <p className="text-xs text-muted-foreground">All time</p>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byCategory}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={90}
                    paddingAngle={3}
                    stroke="var(--background)"
                    strokeWidth={2}
                  >
                    {byCategory.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    formatter={(v: any) => fmtCurrency(Number(v))}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: 11, color: "var(--muted-foreground)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* AI Insights + Recent */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 glass rounded-2xl shadow-card overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h3 className="font-semibold">Recent transactions</h3>
                <p className="text-xs text-muted-foreground">Latest 8 across all accounts</p>
              </div>
              <Link
                to="/expenses"
                className="text-xs text-primary inline-flex items-center gap-1 hover:underline"
              >
                View all <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {(expenses.isLoading ? Array.from({ length: 6 }) : list.slice(0, 8)).map((e: any, i) =>
                expenses.isLoading ? (
                  <div key={i} className="p-4 flex items-center gap-4">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </div>
                ) : (
                  <div key={e.id} className="p-4 flex items-center gap-4 hover:bg-secondary/30">
                    <div
                      className="h-9 w-9 rounded-lg grid place-items-center text-xs font-semibold"
                      style={{
                        background: `color-mix(in oklab, ${CHART_COLORS[i % CHART_COLORS.length]} 15%, transparent)`,
                        color: CHART_COLORS[i % CHART_COLORS.length],
                      }}
                    >
                      {e.merchant?.[0] ?? e.category[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {e.merchant ?? e.category}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {e.category} · {new Date(e.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-sm font-semibold tabular-nums">
                      −{fmtCurrency(e.amount)}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="glass rounded-2xl p-5 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-brand grid place-items-center shadow-glow">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <h3 className="font-semibold">AI Insights</h3>
            </div>
            <div className="space-y-3">
              {(insights.data ?? []).slice(0, 3).map((ins) => (
                <div
                  key={ins.id}
                  className="rounded-xl border border-border p-4 bg-secondary/30 hover:bg-secondary/60 transition-colors"
                >
                  <div className="text-sm font-medium">{ins.title}</div>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    {ins.body}
                  </p>
                </div>
              ))}
              <Link
                to="/ai-insights"
                className="block text-center text-xs text-primary hover:underline pt-2"
              >
                See all insights
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
