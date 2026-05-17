import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Search, Trash2, Pencil } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { expenseService } from "@/services/expense.service";
import type { Expense, ExpenseCategory } from "@/types";
import { fmtCurrency } from "@/utils/format";
import { getApiErrorMessage } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/expenses")({
  head: () => ({ meta: [{ title: "Expenses — Track Expense" }] }),
  component: ExpensesPage,
});

const CATEGORIES: ExpenseCategory[] = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Bills",
  "Health",
  "Travel",
  "Other",
];

const expenseSchema = z.object({
  merchant: z.string().trim().min(1, "Required").max(80),
  amount: z.number().positive("Must be > 0").max(1_000_000),
  category: z.enum([
    "Food",
    "Transport",
    "Shopping",
    "Entertainment",
    "Bills",
    "Health",
    "Travel",
    "Other",
  ]),
  date: z.string().min(1, "Required"),
  note: z.string().max(200).optional(),
});
type ExpenseForm = z.infer<typeof expenseSchema>;

const PAGE_SIZE = 10;

function ExpensesPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: expenseService.list,
  });

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [range, setRange] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const list = data ?? [];
    const now = new Date();
    return list.filter((e) => {
      if (category !== "all" && e.category !== category) return false;
      if (search && !`${e.merchant} ${e.category}`.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (range !== "all") {
        const days = range === "7" ? 7 : range === "30" ? 30 : 90;
        const cut = new Date(now);
        cut.setDate(now.getDate() - days);
        if (new Date(e.date) < cut) return false;
      }
      return true;
    });
  }, [data, search, category, range]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const removeMutation = useMutation({
    mutationFn: (id: string) => expenseService.remove(id),
    onSuccess: () => {
      toast.success("Expense deleted");
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["budgets"] });
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  return (
    <div>
      <Topbar title="Expenses" subtitle="Search, filter and manage every transaction" />
      <div className="px-6 lg:px-8 py-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search merchants or categories…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>
          <Select
            value={category}
            onValueChange={(v) => {
              setCategory(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={range}
            onValueChange={(v) => {
              setRange(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          <Dialog
            open={open}
            onOpenChange={(o) => {
              setOpen(o);
              if (!o) setEditing(null);
            }}
          >
            <DialogTrigger asChild>
              <Button className="md:ml-auto bg-gradient-brand text-primary-foreground border-0 shadow-glow hover:opacity-95">
                <Plus className="h-4 w-4 mr-1" />
                Add expense
              </Button>
            </DialogTrigger>
            <ExpenseDialog
              expense={editing}
              onClose={() => {
                setOpen(false);
                setEditing(null);
              }}
            />
          </Dialog>
        </div>

        <div className="glass rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="p-4 font-medium">Merchant</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium text-right">Amount</th>
                  <th className="p-4 font-medium w-[100px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      <td className="p-4">
                        <Skeleton className="h-4 w-32" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-4 w-20" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-4 w-16 ml-auto" />
                      </td>
                      <td />
                    </tr>
                  ))
                ) : pageItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-muted-foreground">
                      No expenses match your filters.
                    </td>
                  </tr>
                ) : (
                  pageItems.map((e) => (
                    <tr key={e.id} className="hover:bg-secondary/40">
                      <td className="p-4 font-medium">{e.merchant ?? "—"}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-md text-xs bg-secondary text-secondary-foreground">
                          {e.category}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(e.date).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right font-semibold tabular-nums">
                        {fmtCurrency(e.amount)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditing(e);
                              setOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete this expense?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => removeMutation.mutate(e.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between p-4 border-t border-border">
            <div className="text-xs text-muted-foreground">
              Showing {pageItems.length} of {filtered.length}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground tabular-nums">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExpenseDialog({
  expense,
  onClose,
}: {
  expense: Expense | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const isEdit = !!expense;
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseForm>({
    resolver: zodResolver(expenseSchema),
    defaultValues: expense
      ? {
          merchant: expense.merchant ?? "",
          amount: expense.amount,
          category: expense.category,
          date: expense.date.slice(0, 10),
          note: expense.note ?? "",
        }
      : {
          merchant: "",
          amount: 0,
          category: "Food",
          date: new Date().toISOString().slice(0, 10),
          note: "",
        },
  });

  const mutation = useMutation({
    mutationFn: async (v: ExpenseForm) => {
      const payload = { ...v, date: new Date(v.date).toISOString() };
      if (expense) return expenseService.update(expense.id, payload);
      return expenseService.create(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? "Expense updated" : "Expense added");
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["budgets"] });
      reset();
      onClose();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const cat = watch("category");

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{isEdit ? "Edit expense" : "Add new expense"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2 col-span-2">
            <Label htmlFor="merchant">Merchant</Label>
            <Input id="merchant" placeholder="e.g. Whole Foods" {...register("merchant")} />
            {errors.merchant && (
              <p className="text-xs text-destructive">{errors.merchant.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (INR)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              {...register("amount", { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-xs text-destructive">{errors.amount.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" {...register("date")} />
          </div>
          <div className="space-y-2 col-span-2">
            <Label>Category</Label>
            <Select value={cat} onValueChange={(v) => setValue("category", v as ExpenseCategory)}>
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
          <div className="space-y-2 col-span-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Input id="note" {...register("note")} />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-brand text-primary-foreground border-0 hover:opacity-95"
          >
            {isEdit ? "Save changes" : "Add expense"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
