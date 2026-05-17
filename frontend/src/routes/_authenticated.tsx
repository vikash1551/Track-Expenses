import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { TOKEN_KEY } from "@/lib/api";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const t = localStorage.getItem(TOKEN_KEY);
      if (!t) {
        throw redirect({ to: "/login" });
      }
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  );
}
