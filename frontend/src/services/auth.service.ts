import { api, TOKEN_KEY } from "@/lib/api";
import type { AuthResponse, User } from "@/types";

const USE_MOCK = false;

export const authService = {
  async login(email: string, password: string): Promise<string> {
    const { data } = await api.post<string>("/auth/login", { email, password });
    if (data.includes("Invalid") || data.includes("verify your email first")) throw new Error(data);
    return data;
  },
  async verifyLogin(email: string, otp: string): Promise<AuthResponse> {
    const { data } = await api.post<string>("/auth/verify-login", { email, otp });
    if (data.includes("Invalid")) throw new Error(data);
    
    // Set token immediately so we can fetch /me
    localStorage.setItem(TOKEN_KEY, data);
    
    // Now fetch the user profile
    const user = await this.me();
    return { token: data, user };
  },
  async register(name: string, email: string, password: string): Promise<string> {
    const { data } = await api.post<string>("/auth/register", { name, email, password });
    if (data.includes("already registered")) throw new Error(data);
    return data;
  },
  async verifyAccount(email: string, otp: string): Promise<string> {
    const { data } = await api.post<string>("/auth/verify-account", { email, otp });
    if (data.includes("Invalid")) throw new Error(data);
    return data;
  },
  async me(): Promise<User> {
    const { data } = await api.get<User>("/auth/me");
    return data;
  },
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("finflow_user");
  },
  async deleteAccount(): Promise<void> {
    await api.delete("/auth/me");
    this.logout();
  },
};
