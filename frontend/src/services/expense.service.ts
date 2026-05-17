import { api } from "@/lib/api";
import type { Expense } from "@/types";

const USE_MOCK = false;

export const expenseService = {
  async list(): Promise<Expense[]> {
    const { data } = await api.get<any[]>("/expenses");
    return data.map((e) => ({
      id: String(e.id),
      amount: e.amount,
      category: e.category,
      merchant: e.note || e.category,
      date: e.transactionDate,
    }));
  },
  async create(payload: Omit<Expense, "id">): Promise<Expense> {
    const { data } = await api.post<any>("/expenses", {
      amount: payload.amount,
      category: payload.category,
      note: payload.merchant,
      transactionDate: payload.date ? payload.date.slice(0, 10) + "T00:00:00" : null,
    });
    return {
      id: String(data.id),
      amount: data.amount,
      category: data.category,
      merchant: data.note || data.category,
      date: data.transactionDate,
    };
  },
  async update(id: string, payload: Partial<Expense>): Promise<Expense> {
    const { data } = await api.put<any>(`/expenses/${id}`, {
      amount: payload.amount,
      category: payload.category,
      note: payload.merchant,
      transactionDate: payload.date ? payload.date.slice(0, 10) + "T00:00:00" : undefined,
    });
    return {
      id: String(data.id),
      amount: data.amount,
      category: data.category,
      merchant: data.note || data.category,
      date: data.transactionDate,
    };
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/expenses/${id}`);
  },
};
