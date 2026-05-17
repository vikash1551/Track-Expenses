import { api } from "@/lib/api";
import type { AIInsight } from "@/types";

const USE_MOCK = false;

export const insightService = {
  async list(): Promise<AIInsight[]> {
    const { data } = await api.get<string>("/ai/insights");
    return [
      {
        id: "insight_1",
        title: "AI Analysis",
        body: data,
        kind: "summary",
      } as unknown as AIInsight,
    ];
  },
};
