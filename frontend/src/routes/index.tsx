import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")(  {
  head: () => ({
    meta: [
      { title: "Track Expense — Track your expenses" },
      {
        name: "description",
        content:
          "Keep a track on your expenses with Track Expense. Simple, clean, and powerful expense management.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center relative overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 -z-10 opacity-50 [background:radial-gradient(55%_45%_at_50%_40%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_70%)]" />

      {/* Logo */}
      <Link to="/" className="flex flex-col items-center gap-2.5 mb-10">
        <div className="flex items-center gap-2 font-semibold">
          <div className="h-8 w-8 rounded-lg shadow-glow overflow-hidden">
            <img src="/logo.png" alt="Track Expense" className="h-full w-full object-cover" />
          </div>
          <div className="font-display font-semibold text-lg">Track Expense</div>
        </div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Expense Tracker
        </div>
      </Link>

      {/* Main heading */}
      <h1 className="font-display text-4xl md:text-6xl font-semibold tracking-tight leading-[1.1] text-center max-w-2xl px-6">
        Keep a track on your expenses
      </h1>

      {/* Get Started button */}
      <div className="mt-10">
        <Link
          to="/register"
          className="inline-flex h-12 items-center gap-2.5 px-8 rounded-xl bg-primary text-primary-foreground font-medium text-base shadow-glow hover:opacity-90 transition-opacity"
        >
          Get Started <ArrowRight className="h-4.5 w-4.5" />
        </Link>
      </div>

      {/* Already have an account */}
      <p className="mt-6 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="text-primary hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
