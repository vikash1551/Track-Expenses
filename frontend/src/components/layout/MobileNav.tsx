import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  Sparkles,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNav = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { to: "/expenses", icon: Receipt, label: "Expenses" },
  { to: "/budgets", icon: Wallet, label: "Budgets" },
  { to: "/ai-insights", icon: Sparkles, label: "AI" },
  { to: "/profile", icon: Settings, label: "Settings" },
] as const;

export function MobileNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border pb-safe">
      <nav className="flex items-center justify-around px-2 py-2">
        {mobileNav.map((item) => {
          const Icon = item.icon;
          const active = path === item.to || path.startsWith(item.to + "/");
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-12 gap-1 rounded-xl transition-all",
                active
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300",
                  active ? "bg-primary/10" : "bg-transparent"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
