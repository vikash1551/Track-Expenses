import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { AlertTriangle, Sparkles, Trash2, TrendingUp, Wallet } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { budgetService } from "@/services/budget.service";
import { expenseService } from "@/services/expense.service";
import { insightService } from "@/services/insight.service";
import { fmtCurrency } from "@/utils/format";
import type { Expense, Budget } from "@/types";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Track Expense" }] }),
  component: NotificationsPage,
});

interface Notification {
  id: string;
  icon: typeof AlertTriangle;
  color: string;
  title: string;
  body: string;
  time: string;
}

function generateBudgetNotifications(
  budgets: Budget[],
  expenses: Expense[]
): Notification[] {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Calculate spending per category for the current month
  const spendByCategory: Record<string, number> = {};
  for (const exp of expenses) {
    const expDate = new Date(exp.date);
    if (expDate >= monthStart) {
      spendByCategory[exp.category] =
        (spendByCategory[exp.category] || 0) + exp.amount;
    }
  }

  const notifications: Notification[] = [];

  for (const budget of budgets) {
    if (budget.category === "Total") continue;
    const spent = spendByCategory[budget.category] || 0;
    if (budget.limit <= 0) continue;

    const pct = Math.round((spent / budget.limit) * 100);

    if (pct >= 100) {
      notifications.push({
        id: `budget-over-${budget.category}`,
        icon: AlertTriangle,
        color: "text-red-500 bg-red-500/10",
        title: `${budget.category} budget exceeded!`,
        body: `You've spent ${fmtCurrency(spent)} which is ${pct}% of your ${fmtCurrency(budget.limit)} monthly ${budget.category} budget.`,
        time: "Now",
      });
    } else if (pct >= 80) {
      notifications.push({
        id: `budget-warn-${budget.category}`,
        icon: AlertTriangle,
        color: "text-warning bg-warning/10",
        title: `Approaching ${budget.category} budget limit`,
        body: `You've spent ${pct}% of your ${fmtCurrency(budget.limit)} monthly ${budget.category} budget. Only ${fmtCurrency(budget.limit - spent)} remaining.`,
        time: "Now",
      });
    } else if (pct >= 50) {
      notifications.push({
        id: `budget-half-${budget.category}`,
        icon: Wallet,
        color: "text-info bg-info/10",
        title: `${budget.category} budget is half used`,
        body: `You've used ${pct}% (${fmtCurrency(spent)}) of your ${fmtCurrency(budget.limit)} ${budget.category} budget this month.`,
        time: "Today",
      });
    }
  }

  // Total spending notification
  const totalSpent = Object.values(spendByCategory).reduce((a, b) => a + b, 0);
  const totalBudget = budgets.find((b) => b.category === "Total");
  if (totalBudget && totalBudget.limit > 0) {
    const totalPct = Math.round((totalSpent / totalBudget.limit) * 100);
    if (totalPct >= 100) {
      notifications.unshift({
        id: "budget-total-over",
        icon: AlertTriangle,
        color: "text-red-500 bg-red-500/10",
        title: "Overall budget exceeded!",
        body: `Total spending this month is ${fmtCurrency(totalSpent)} — ${totalPct}% of your ${fmtCurrency(totalBudget.limit)} total budget.`,
        time: "Now",
      });
    } else if (totalPct >= 75) {
      notifications.unshift({
        id: "budget-total-warn",
        icon: AlertTriangle,
        color: "text-warning bg-warning/10",
        title: "Approaching overall budget limit",
        body: `You've spent ${totalPct}% of your total ${fmtCurrency(totalBudget.limit)} monthly budget. ${fmtCurrency(totalBudget.limit - totalSpent)} remaining.`,
        time: "Now",
      });
    }
  }

  // High single expense alert (top expense of the month)
  const monthlyExpenses = expenses.filter((e) => new Date(e.date) >= monthStart);
  if (monthlyExpenses.length > 0) {
    const topExpense = monthlyExpenses.reduce((max, e) =>
      e.amount > max.amount ? e : max
    );
    if (topExpense.amount >= 1000) {
      notifications.push({
        id: `high-expense-${topExpense.id}`,
        icon: TrendingUp,
        color: "text-accent bg-accent/10",
        title: "Large expense detected",
        body: `Your highest expense this month is ${fmtCurrency(topExpense.amount)} for "${topExpense.merchant}" in ${topExpense.category}.`,
        time: "This month",
      });
    }
  }

  return notifications;
}

function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem("te_dismissed_notifs");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [budgets, expenses] = await Promise.all([
          budgetService.list(),
          expenseService.list(),
        ]);

        const budgetNotifs = generateBudgetNotifications(budgets, expenses);

        // Try to get AI insight
        let aiNotifs: Notification[] = [];
        try {
          const insights = await insightService.list();
          if (insights.length > 0 && insights[0].body && insights[0].body.trim().length > 10) {
            aiNotifs.push({
              id: "ai-insight",
              icon: Sparkles,
              color: "text-accent bg-accent/10",
              title: "AI Insight",
              body: insights[0].body.length > 200
                ? insights[0].body.slice(0, 200) + "…"
                : insights[0].body,
              time: "Just now",
            });
          }
        } catch {
          // AI insights not available — skip
        }

        const allNotifs = [...budgetNotifs, ...aiNotifs];
        setItems(allNotifs.filter((n) => !dismissed.has(n.id)));
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [dismissed]);

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const deleteSelected = () => {
    const newDismissed = new Set(dismissed);
    selected.forEach((id) => newDismissed.add(id));
    localStorage.setItem(
      "te_dismissed_notifs",
      JSON.stringify([...newDismissed])
    );
    setDismissed(newDismissed);
    setItems(items.filter((item) => !selected.has(item.id)));
    setSelected(new Set());
  };

  return (
    <div>
      <Topbar title="Notifications" subtitle="Budget alerts and AI insights" />
      <div className="px-6 lg:px-8 py-6">
        <div className="max-w-3xl mb-4 flex justify-between items-center h-9">
          <div className="text-sm font-medium">
            {selected.size > 0 ? `${selected.size} selected` : ""}
          </div>
          {selected.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={deleteSelected}
              className="bg-red-50 text-red-600 hover:bg-red-100 border-0"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Dismiss Selected
            </Button>
          )}
        </div>
        <div className="glass rounded-2xl shadow-card divide-y divide-border overflow-hidden max-w-3xl">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading notifications...
            </div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              🎉 No notifications — you're on track!
            </div>
          ) : (
            items.map((n) => {
              const Icon = n.icon;
              return (
                <div
                  key={n.id}
                  className="p-5 flex items-start gap-4 hover:bg-secondary/30"
                >
                  <div className="pt-2">
                    <Checkbox
                      checked={selected.has(n.id)}
                      onCheckedChange={() => toggleSelect(n.id)}
                    />
                  </div>
                  <div
                    className={`h-10 w-10 rounded-xl grid place-items-center shrink-0 ${n.color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium text-sm">{n.title}</div>
                      <div className="text-xs text-muted-foreground shrink-0">
                        {n.time}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {n.body}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
