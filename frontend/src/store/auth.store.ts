import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { TOKEN_KEY } from "@/lib/api";
import { authService } from "@/services/auth.service";

interface AuthState {
  token: string | null;
  user: User | null;
  status: "idle" | "loading" | "ready";
  login: (email: string, password: string) => Promise<string>;
  verifyLogin: (email: string, otp: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<string>;
  verifyAccount: (email: string, otp: string) => Promise<string>;
  logout: () => void;
  deleteAccount: () => Promise<void>;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      status: "idle",
      hydrate: () => {
        const t = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
        if (t && !get().token) set({ token: t });
        set({ status: "ready" });
      },
      login: async (email, password) => {
        set({ status: "loading" });
        try {
          const res = await authService.login(email, password);
          set({ status: "ready" });
          return res;
        } catch (e) {
          set({ status: "ready" });
          throw e;
        }
      },
      verifyLogin: async (email, otp) => {
        set({ status: "loading" });
        try {
          const res = await authService.verifyLogin(email, otp);
          localStorage.setItem("finflow_user", JSON.stringify(res.user));
          set({ token: res.token, user: res.user, status: "ready" });
        } catch (e) {
          set({ status: "ready" });
          throw e;
        }
      },
      register: async (name, email, password) => {
        set({ status: "loading" });
        try {
          const res = await authService.register(name, email, password);
          set({ status: "ready" });
          return res;
        } catch (e) {
          set({ status: "ready" });
          throw e;
        }
      },
      verifyAccount: async (email, otp) => {
        set({ status: "loading" });
        try {
          const res = await authService.verifyAccount(email, otp);
          set({ status: "ready" });
          return res;
        } catch (e) {
          set({ status: "ready" });
          throw e;
        }
      },
      logout: () => {
        authService.logout();
        set({ token: null, user: null });
      },
      deleteAccount: async () => {
        set({ status: "loading" });
        try {
          await authService.deleteAccount();
          set({ token: null, user: null, status: "ready" });
        } catch (e) {
          set({ status: "ready" });
          throw e;
        }
      },
    }),
    {
      name: "finflow-auth",
      partialize: (s) => ({ user: s.user, token: s.token }),
    }
  )
);
