import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  BarChart3,
  Sparkles,
  Bell,
  Settings,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/expenses", icon: Receipt, label: "Expenses" },
  { to: "/budgets", icon: Wallet, label: "Budgets" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
  { to: "/ai-insights", icon: Sparkles, label: "AI Insights" },
  { to: "/profile", icon: Settings, label: "Settings" },
] as const;

export function AppSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="px-6 py-5 flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-lg shadow-glow shrink-0 overflow-hidden">
          <img src="/logo.png" alt="Track Expense" className="h-full w-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display font-semibold text-base leading-none">Track Expense</div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">
            AI Finance OS
          </div>
        </div>
      </div>

      <nav className="px-3 mt-2 flex-1 space-y-0.5">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = path === item.to || path.startsWith(item.to + "/");
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                active &&
                  "bg-sidebar-accent text-sidebar-accent-foreground font-medium relative before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-0.5 before:rounded-r before:bg-primary"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border space-y-2">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          <div className="h-9 w-9 rounded-full bg-gradient-brand grid place-items-center text-sm font-semibold text-primary-foreground shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{user?.name ?? "User"}</div>
            <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
          </div>
          <button
            onClick={() => {
              logout();
              window.location.href = "/login";
            }}
            aria-label="Log out"
            title="Log out"
            className="p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
