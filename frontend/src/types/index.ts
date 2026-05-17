export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type ExpenseCategory =
  | "Food"
  | "Transport"
  | "Shopping"
  | "Entertainment"
  | "Bills"
  | "Health"
  | "Travel"
  | "Other";

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  note?: string;
  date: string; // ISO
  merchant?: string;
}

export interface Budget {
  id: string;
  category: ExpenseCategory | "Total";
  limit: number;
  spent: number;
  period: "monthly";
}

export interface AIInsight {
  id: string;
  kind: "summary" | "tip" | "alert" | "savings";
  title: string;
  body: string;
  createdAt: string;
}
