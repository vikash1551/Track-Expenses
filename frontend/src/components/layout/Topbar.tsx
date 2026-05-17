import { Search, Bell, ArrowLeft, IndianRupee, Wallet, X } from "lucide-react";
import { Link, useRouter, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { expenseService } from "@/services/expense.service";
import { budgetService } from "@/services/budget.service";
import { fmtCurrency } from "@/utils/format";

interface TopbarProps {
  title: string;
  subtitle?: string;
}

interface SearchResult {
  id: string;
  type: "expense" | "budget";
  title: string;
  subtitle: string;
  amount: string;
  link: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  const router = useRouter();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: expenses } = useQuery({
    queryKey: ["expenses"],
    queryFn: expenseService.list,
  });

  const { data: budgets } = useQuery({
    queryKey: ["budgets"],
    queryFn: budgetService.list,
  });

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const items: SearchResult[] = [];

    // Search expenses
    (expenses ?? []).forEach((e) => {
      const match =
        e.category.toLowerCase().includes(q) ||
        (e.merchant ?? "").toLowerCase().includes(q);
      if (match) {
        items.push({
          id: `exp-${e.id}`,
          type: "expense",
          title: e.merchant ?? e.category,
          subtitle: `${e.category} · ${new Date(e.date).toLocaleDateString()}`,
          amount: fmtCurrency(e.amount),
          link: "/expenses",
        });
      }
    });

    // Search budgets
    (budgets ?? []).forEach((b) => {
      if (b.category.toLowerCase().includes(q)) {
        items.push({
          id: `bud-${b.id}`,
          type: "budget",
          title: b.category,
          subtitle: `Budget limit`,
          amount: fmtCurrency(b.limit),
          link: "/budgets",
        });
      }
    });

    return items.slice(0, 10); // Cap at 10 results
  }, [query, expenses, budgets]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setQuery("");
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      router.navigate({ to: "/dashboard" });
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setQuery("");
    navigate({ to: result.link as any });
  };

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="flex items-center gap-4 px-6 lg:px-8 py-4">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Go back"
          className="h-9 w-9 grid place-items-center rounded-lg border border-border hover:bg-secondary transition-colors shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight truncate">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Search */}
        <div className="hidden md:block relative">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-1.5 w-72">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => query.trim() && setIsOpen(true)}
              placeholder="Search expenses, budgets…"
              className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setIsOpen(false);
                  inputRef.current?.focus();
                }}
                className="shrink-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {isOpen && query.trim() && (
            <div
              ref={dropdownRef}
              className="absolute top-full right-0 mt-2 w-96 rounded-xl border border-border bg-popover shadow-lg overflow-hidden z-50"
            >
              {results.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  No results found for "{query}"
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
                    {results.length} result{results.length !== 1 ? "s" : ""}
                  </div>
                  {results.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => handleResultClick(r)}
                      className="w-full flex items-center gap-3 px-3 py-3 hover:bg-secondary/50 transition-colors text-left border-b border-border last:border-0"
                    >
                      <div
                        className={`h-9 w-9 rounded-lg grid place-items-center shrink-0 ${
                          r.type === "expense"
                            ? "bg-primary/10 text-primary"
                            : "bg-info/10 text-info"
                        }`}
                      >
                        {r.type === "expense" ? (
                          <IndianRupee className="h-4 w-4" />
                        ) : (
                          <Wallet className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {r.title}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {r.subtitle}
                        </div>
                      </div>
                      <div className="text-sm font-semibold tabular-nums shrink-0">
                        {r.type === "expense" ? `−${r.amount}` : r.amount}
                      </div>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          r.type === "expense"
                            ? "bg-primary/10 text-primary"
                            : "bg-info/10 text-info"
                        }`}
                      >
                        {r.type === "expense" ? "Expense" : "Budget"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <Link
          to="/notifications"
          className="relative h-9 w-9 grid place-items-center rounded-lg border border-border hover:bg-secondary transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
        </Link>
      </div>
    </header>
  );
}
