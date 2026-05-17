import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/layout/Topbar";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "@tanstack/react-router";
import { Trash2, Monitor, Sun, Moon, LogOut } from "lucide-react";
import { useTheme, Theme } from "@/hooks/use-theme";
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
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Settings — Track Expense" }] }),
  component: ProfilePage,
});

const schema = z.object({
  name: z.string().trim().min(2).max(80),
});
type FormValues = z.infer<typeof schema>;

function ProfilePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);
  const logout = useAuthStore((s) => s.logout);
  const { theme, setTheme } = useTheme();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name ?? "" },
  });

  const onSubmit = async (_v: FormValues) => {
    await new Promise((r) => setTimeout(r, 400));
    toast.success("Profile updated");
  };

  const handleDelete = async () => {
    try {
      await deleteAccount();
      toast.success("Account deleted forever.");
      router.navigate({ to: "/login" });
    } catch (err) {
      toast.error("Failed to delete account");
    }
  };

  return (
    <div>
      <Topbar title="Settings" subtitle="Manage your account and preferences" />
      <div className="px-6 lg:px-8 py-6">
        <div className="max-w-2xl glass rounded-2xl shadow-card p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-brand grid place-items-center text-xl font-semibold text-primary-foreground shadow-glow">
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div>
              <div className="text-lg font-semibold">{user?.name}</div>
              <div className="text-sm text-muted-foreground">{user?.email}</div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">User name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-white border-0 hover:opacity-95"
              >
                Save changes
              </Button>
            </div>
          </form>

          <div className="mt-12 pt-6 border-t border-border">
            <h3 className="text-lg font-semibold mb-4">Appearance</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setTheme("light")}
                className={cn(
                  "flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                  theme === "light" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                )}
              >
                <Sun className="h-6 w-6 text-foreground" />
                <span className="text-sm font-medium">Light</span>
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={cn(
                  "flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                  theme === "dark" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                )}
              >
                <Moon className="h-6 w-6 text-foreground" />
                <span className="text-sm font-medium">Dark</span>
              </button>
              <button
                onClick={() => setTheme("system")}
                className={cn(
                  "flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                  theme === "system" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                )}
              >
                <Monitor className="h-6 w-6 text-foreground" />
                <span className="text-sm font-medium">System</span>
              </button>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-border">
            <h3 className="text-lg font-semibold mb-4">Account</h3>
            <Button 
              variant="outline" 
              onClick={() => {
                logout();
                window.location.href = "/login";
              }}
            >
              <LogOut className="h-4 w-4 mr-2" /> Log out
            </Button>
          </div>

          <div className="mt-12 pt-6 border-t border-border">
            <h3 className="text-lg font-semibold text-destructive mb-2">Danger Zone</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Permanently delete your account and all of your expenses and budgets. This action cannot be undone.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-0">
                  <Trash2 className="h-4 w-4 mr-2" /> Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your Track Expense account, along with all of your recorded expenses, budgets, and personal data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, delete my account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
