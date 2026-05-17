import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Topbar } from "@/components/layout/Topbar";
import { budgetService } from "@/services/budget.service";
import { expenseService } from "@/services/expense.service";
import { fmtCurrency } from "@/utils/format";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Wallet, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/budgets")({
  head: () => ({ meta: [{ title: "Budgets — Track Expense" }] }),
  component: BudgetsPage,
});

const CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Bills",
  "Health",
  "Travel",
  "Other",
];

function BudgetsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCat, setNewCat] = useState("Food");
  const [newLimit, setNewLimit] = useState("");

  const { data: budgets, isLoading: isBLoading } = useQuery({
    queryKey: ["budgets"],
    queryFn: budgetService.list,
  });

  const { data: expenses, isLoading: isELoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: expenseService.list,
  });

  const isLoading = isBLoading || isELoading;

  const cats = (budgets ?? []).map((b) => {
    const spent = (expenses ?? [])
      .filter((e) => e.category.toLowerCase() === b.category.toLowerCase())
      .reduce((sum, e) => sum + e.amount, 0);
    return { ...b, spent };
  });

  const totalLimit = cats.reduce((sum, c) => sum + c.limit, 0);
  const totalSpent = (expenses ?? []).reduce((sum, e) => sum + e.amount, 0);

  const total = {
    limit: totalLimit > 0 ? totalLimit : 1, // Avoid dev by 0
    spent: totalSpent,
  };

  const createMutation = useMutation({
    mutationFn: budgetService.upsert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Budget added!");
      setIsModalOpen(false);
      setNewCat("Food");
      setNewLimit("");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Failed to add budget"));
    },
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat || !newLimit) return;
    createMutation.mutate({ category: newCat, limit: parseFloat(newLimit) });
  };

  return (
    <div>
      <Topbar title="Budgets" subtitle="Set guardrails. Stay in flow." />
      <div className="px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold font-display">Overview</h2>
          <Button onClick={() => setIsModalOpen(true)} size="sm" className="bg-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" /> Add Budget
          </Button>
        </div>

        {isLoading ? (
          <Skeleton className="h-40 rounded-2xl" />
        ) : (
          <div className="glass rounded-2xl p-6 shadow-card relative overflow-hidden">
            <div
              className="absolute -top-24 -right-24 h-64 w-64 rounded-full opacity-30 blur-3xl"
              style={{ background: "var(--gradient-brand)" }}
            />
            <div className="relative flex flex-col md:flex-row md:items-center gap-6">
              <div className="h-14 w-14 rounded-2xl bg-gradient-brand grid place-items-center shadow-glow shrink-0">
                <Wallet className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Monthly Budget
                </div>
                <div className="mt-1 flex items-baseline gap-3 flex-wrap">
                  <div className="text-3xl font-semibold font-display">
                    {fmtCurrency(total.spent)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    of {fmtCurrency(totalLimit)} limit
                  </div>
                </div>
                <Progress
                  value={Math.min(100, (total.spent / total.limit) * 100)}
                  className="mt-4 h-2"
                />
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>{Math.round((total.spent / total.limit) * 100)}% used</span>
                  <span>
                    {fmtCurrency(Math.max(0, totalLimit - total.spent))} remaining
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-2xl" />
            ))
          ) : cats.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No budgets set. Click "Add Budget" to set your first guardrail.
            </div>
          ) : (
            cats.map((b) => {
              const pct = Math.min(100, (b.spent / b.limit) * 100);
              const over = b.spent > b.limit;
              const warn = pct >= 80 && !over;
              return (
                <div
                  key={b.id}
                  className="glass rounded-2xl p-5 shadow-card animate-fade-up"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{b.category}</div>
                    {(over || warn) && (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
                          over
                            ? "bg-destructive/15 text-destructive"
                            : "bg-warning/15 text-warning"
                        )}
                      >
                        <AlertTriangle className="h-3 w-3" />
                        {over ? "Over budget" : "Near limit"}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-2xl font-semibold font-display tabular-nums">
                      {fmtCurrency(b.spent)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      / {fmtCurrency(b.limit)}
                    </span>
                  </div>
                  <Progress value={pct} className={cn("mt-4 h-1.5", over && "bg-destructive/20")} />
                  <div className="mt-2 text-xs text-muted-foreground">
                    {over
                      ? `${fmtCurrency(b.spent - b.limit)} over`
                      : `${fmtCurrency(b.limit - b.spent)} left`}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-sm glass rounded-2xl p-6 shadow-glow relative animate-fade-up border border-border">
            <h3 className="text-lg font-semibold mb-4">Set Category Budget</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={newCat} onValueChange={setNewCat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lim">Monthly Limit (INR)</Label>
                <Input
                  id="lim"
                  type="number"
                  min="1"
                  step="0.01"
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Saving..." : "Save Budget"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
