import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { Topbar } from "@/components/layout/Topbar";
import { expenseService } from "@/services/expense.service";
import { Skeleton } from "@/components/ui/skeleton";
import { fmtCurrency } from "@/utils/format";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({ meta: [{ title: "Reports — Track Expense" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: expenseService.list,
  });

  const list = data ?? [];

  // Last 6 months
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const sum = list
      .filter((e) => {
        const ed = new Date(e.date);
        return `${ed.getFullYear()}-${ed.getMonth()}` === key;
      })
      .reduce((s, e) => s + e.amount, 0);
    return {
      label: d.toLocaleDateString(undefined, { month: "short" }),
      total: Math.round(sum),
    };
  });

  // By category
  const catTotals: Record<string, number> = {};
  list.forEach((e) => {
    catTotals[e.category] = (catTotals[e.category] ?? 0) + e.amount;
  });
  const byCat = Object.entries(catTotals)
    .map(([category, total]) => ({ category, total: Math.round(total) }))
    .sort((a, b) => b.total - a.total);

  return (
    <div>
      <Topbar title="Reports" subtitle="Historical performance and category breakdowns" />
      <div className="px-6 lg:px-8 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-5 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Monthly spend</h3>
                <p className="text-xs text-muted-foreground">Last 6 months</p>
              </div>
            </div>
            {isLoading ? (
              <Skeleton className="h-72 rounded-xl" />
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={months} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
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
                        fontSize: 12,
                      }}
                      formatter={(v: any) => fmtCurrency(Number(v))}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="var(--chart-1)"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "var(--chart-1)" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="glass rounded-2xl p-5 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">By category</h3>
                <p className="text-xs text-muted-foreground">All transactions</p>
              </div>
            </div>
            {isLoading ? (
              <Skeleton className="h-72 rounded-xl" />
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byCat} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="category"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                      width={40}
                    />
                    <Tooltip
                      cursor={{ fill: "var(--secondary)" }}
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                      formatter={(v: any) => fmtCurrency(Number(v))}
                    />
                    <Bar dataKey="total" fill="var(--chart-2)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
