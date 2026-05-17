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
import { Loader2 } from "lucide-react";
import { BrandPanel } from "./login";
import { useState } from "react";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — Track Expense" }] }),
  component: RegisterPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "Min 6 characters").max(72),
});
type FormValues = z.infer<typeof schema>;

function RegisterPage() {
  const register2 = useAuthStore((s) => s.register);
  const verifyAccount = useAuthStore((s) => s.verifyAccount);
  const navigate = useNavigate();
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [userEmail, setUserEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (v: FormValues) => {
    try {
      const msg = await register2(v.name, v.email, v.password);
      toast.success(msg);
      setUserEmail(v.email);
      setStep("otp");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not create account"));
    }
  };

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setIsLoading(true);
    try {
      const msg = await verifyAccount(userEmail, otp);
      toast.success(msg);
      navigate({ to: "/login" });
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
            <h1 className="text-3xl font-semibold tracking-tight">
              {step === "credentials" ? "Create your account" : "Verify Email"}
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              {step === "credentials"
                ? "Two minutes to a smarter financial life."
                : `We sent a code to ${userEmail}`}
            </p>
          </div>

          {step === "credentials" ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-900">Full name</Label>
                <Input id="name" className="bg-white border-slate-200 text-slate-900 focus-visible:ring-primary" {...register("name")} />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-900">Email</Label>
                <Input id="email" type="email" autoComplete="email" className="bg-white border-slate-200 text-slate-900 focus-visible:ring-primary" {...register("email")} />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-900">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  className="bg-white border-slate-200 text-slate-900 focus-visible:ring-primary"
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
                Create account
              </Button>
            </form>
          ) : (
            <form onSubmit={onVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-slate-900">Verification Code</Label>
                <Input
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="bg-white border-slate-200 text-slate-900 focus-visible:ring-primary"
                  placeholder="Enter 6-digit code"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white border-0 shadow-glow hover:opacity-95"
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Verify Email
              </Button>
            </form>
          )}

          {step === "credentials" && (
            <p className="mt-6 text-sm text-slate-500 text-center">
              Already have an account?{" "}
              <Link to="/login" className="text-slate-900 underline-offset-4 hover:underline">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
