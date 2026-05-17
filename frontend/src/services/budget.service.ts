import { api } from "@/lib/api";
import type { Budget } from "@/types";

const USE_MOCK = false;

export const budgetService = {
  async list(): Promise<Budget[]> {
    const { data } = await api.get<any[]>("/budgets");
    return data.map((b) => ({
      id: String(b.id),
      category: b.category,
      limit: b.monthlyLimit,
      spent: 0,
    }));
  },
  async upsert(payload: Omit<Budget, "id" | "spent">): Promise<Budget> {
    const { data } = await api.post<any>("/budgets", {
      category: payload.category,
      monthlyLimit: payload.limit,
    });
    return {
      id: String(data.id),
      category: data.category,
      limit: data.monthlyLimit,
      spent: 0,
    };
  },
};
