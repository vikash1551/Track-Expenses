import type { AIInsight, Budget, Expense, ExpenseCategory } from "@/types";

const cats: ExpenseCategory[] = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Bills",
  "Health",
  "Travel",
  "Other",
];

const merchants: Record<ExpenseCategory, string[]> = {
  Food: ["Whole Foods", "Blue Bottle", "Sweetgreen", "Trader Joe's"],
  Transport: ["Uber", "Lyft", "Shell", "Metro Card"],
  Shopping: ["Amazon", "Apple Store", "Zara", "IKEA"],
  Entertainment: ["Netflix", "Spotify", "AMC", "Steam"],
  Bills: ["Comcast", "AT&T", "Con Edison", "Rent"],
  Health: ["CVS", "ClassPass", "Equinox"],
  Travel: ["Delta", "Airbnb", "Marriott"],
  Other: ["Misc", "Cash withdrawal"],
};

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function seededExpenses(): Expense[] {
  const out: Expense[] = [];
  const now = new Date();
  for (let i = 0; i < 64; i++) {
    const cat = rand(cats);
    const d = new Date(now);
    d.setDate(now.getDate() - Math.floor(Math.random() * 60));
    out.push({
      id: `exp_${i}_${Math.random().toString(36).slice(2, 8)}`,
      amount: Math.round((Math.random() * 280 + 5) * 100) / 100,
      category: cat,
      merchant: rand(merchants[cat]),
      note: "",
      date: d.toISOString(),
    });
  }
  return out.sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

let _expenses: Expense[] = seededExpenses();

export const mockDb = {
  list(): Expense[] {
    return [..._expenses];
  },
  add(e: Omit<Expense, "id">): Expense {
    const item: Expense = { ...e, id: `exp_${Date.now()}` };
    _expenses = [item, ..._expenses];
    return item;
  },
  update(id: string, patch: Partial<Expense>): Expense | null {
    const idx = _expenses.findIndex((x) => x.id === id);
    if (idx === -1) return null;
    _expenses[idx] = { ..._expenses[idx], ...patch };
    return _expenses[idx];
  },
  remove(id: string): void {
    _expenses = _expenses.filter((x) => x.id !== id);
  },
};

export function mockBudgets(): Budget[] {
  const list = mockDb.list();
  const totalSpent = list.reduce((s, e) => s + e.amount, 0);
  const byCat = cats.map<Budget>((c) => {
    const spent = list.filter((e) => e.category === c).reduce((s, e) => s + e.amount, 0);
    const limit = Math.round((spent * 1.2 + 200) / 10) * 10;
    return { id: `b_${c}`, category: c, limit, spent, period: "monthly" };
  });
  return [
    { id: "b_total", category: "Total", limit: 4500, spent: totalSpent, period: "monthly" },
    ...byCat,
  ];
}

export function mockInsights(): AIInsight[] {
  return [
    {
      id: "i1",
      kind: "summary",
      title: "You're trending 12% under budget",
      body: "Across the last 30 days you've spent $2,341 of your $2,650 monthly target. Strong control on Bills and Transport.",
      createdAt: new Date().toISOString(),
    },
    {
      id: "i2",
      kind: "tip",
      title: "Cut $48/mo on subscriptions",
      body: "We detected 3 unused streaming services charged in the last 60 days. Cancelling Hulu and Apple TV+ would free up ~$48 monthly.",
      createdAt: new Date().toISOString(),
    },
    {
      id: "i3",
      kind: "savings",
      title: "Move $320 to savings",
      body: "Your projected leftover for this month is $412. Auto-transferring $320 keeps a safe buffer and grows your runway.",
      createdAt: new Date().toISOString(),
    },
    {
      id: "i4",
      kind: "alert",
      title: "Unusual charge detected",
      body: "A $189.00 charge from an unknown merchant on Tuesday is 3.4× your usual transaction size. Review and confirm.",
      createdAt: new Date().toISOString(),
    },
  ];
}
