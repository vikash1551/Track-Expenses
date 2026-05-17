import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api";
import { Loader2, ShieldCheck, TrendingUp, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Track Expense" }] }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "Min 6 characters").max(72),
});
type FormValues = z.infer<typeof schema>;

function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const verifyLogin = useAuthStore((s) => s.verifyLogin);
  const navigate = useNavigate();
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [userEmail, setUserEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const msg = await login(values.email, values.password);
      toast.success(msg);
      setUserEmail(values.email);
      setStep("otp");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not sign in"));
    }
  };

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setIsLoading(true);
    try {
      await verifyLogin(userEmail, otp);
      toast.success("Welcome back!");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Invalid OTP"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white text-slate-900">
      <BrandPanel />
      <div className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-8">
            <Link to="/login" className="inline-flex items-center gap-2 mb-8 lg:hidden">
              <span className="h-8 w-8 rounded-lg bg-primary grid place-items-center font-bold text-white">
                F
              </span>
              <span className="font-display font-semibold">Track Expense</span>
            </Link>
            <h1 className="text-3xl font-semibold tracking-tight">
              {step === "credentials" ? "Welcome back" : "Two-Factor Auth"}
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              {step === "credentials"
                ? "Sign in to your finance command center."
                : `We sent a code to ${userEmail}`}
            </p>
          </div>

          {step === "credentials" ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-900">Email</Label>
                <Input id="email" type="email" autoComplete="email" className="bg-white border-slate-200 text-slate-900 focus-visible:ring-primary" {...register("email")} />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-900">Password</Label>
                  <a className="text-xs text-slate-500 hover:text-slate-900" href="#">
                    Forgot?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  className="bg-white border-slate-200 text-slate-900 focus-visible:ring-primary"
                  autoComplete="current-password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white border-0 shadow-glow hover:opacity-95"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Sign in
              </Button>
            </form>
          ) : (
            <form onSubmit={onVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-slate-900">Security Code (OTP)</Label>
                <Input
                  id="otp"
                  value={otp}
                  className="bg-white border-slate-200 text-slate-900 focus-visible:ring-primary"
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit code"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white border-0 shadow-glow hover:opacity-95"
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Verify & Login
              </Button>
            </form>
          )}

          {step === "credentials" && (
            <p className="mt-6 text-sm text-slate-500 text-center">
              New to Track Expense?{" "}
              <Link to="/register" className="text-slate-900 underline-offset-4 hover:underline">
                Create an account
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function BrandPanel() {
  const [userCount, setUserCount] = useState<number | null>(null);

  useEffect(() => {
    api.get("/auth/user-count")
      .then((res) => setUserCount(res.data.count ?? 0))
      .catch(() => setUserCount(0));
  }, []);

  return (
    <div className="hidden lg:flex relative overflow-hidden bg-primary text-primary-foreground p-12 flex-col justify-between">
      <div
        className="absolute -top-40 -right-40 h-[480px] w-[480px] rounded-full opacity-20 blur-3xl bg-white"
      />
      <div className="absolute -bottom-32 -left-20 h-[380px] w-[380px] rounded-full opacity-10 blur-3xl bg-white" />

      <div className="relative flex items-center gap-2.5">
        <div className="h-10 w-10 rounded-xl bg-white grid place-items-center shadow-card">
          <span className="font-display font-bold text-primary">F</span>
        </div>
        <div>
          <div className="font-display font-semibold">Track Expense</div>
          <div className="text-[10px] uppercase tracking-[0.2em] opacity-80">
            AI Finance OS
          </div>
        </div>
      </div>

      <div className="relative max-w-md">
        <h2 className="text-4xl font-semibold tracking-tight font-display leading-[1.1]">
          Your money, <span className="opacity-90">intelligently</span> in flow.
        </h2>
        <p className="mt-4 opacity-80">
          Track every rupee, automate budgets, and let AI surface the savings you're missing.
        </p>

        <div className="mt-10 space-y-4">
          {[
            { Icon: TrendingUp, t: "Real-time spend analytics", d: "See where every rupee goes." },
            { Icon: Sparkles, t: "AI insights & alerts", d: "Catch fraud and overspending early." },
          ].map(({ Icon, t, d }) => (
            <div key={t} className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-white/20 text-white grid place-items-center shrink-0">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <div className="font-medium text-sm">{t}</div>
                <div className="text-xs opacity-70">{d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative text-xs opacity-60">
        © {new Date().getFullYear()} Track Expense · Trusted by {userCount !== null ? `${userCount}+` : "..."} customers
      </div>
    </div>
  );
}
