import { api } from "@/lib/api";
import type { AIInsight } from "@/types";

const USE_MOCK = false;

export const insightService = {
  async list(): Promise<AIInsight[]> {
    const { data } = await api.get<string>("/ai/insights");
    
    // Parse the AI response into separate tips based on common delimiters
    const rawText = typeof data === "string" ? data : JSON.stringify(data);
    const parts = rawText.split(/(?=💡 Tip:|Tip \d:|1\.|2\.)/).filter(p => p.trim());
    
    if (parts.length > 1) {
      return parts.map((part, index) => ({
        id: `insight_${index}`,
        title: `Saving Opportunity ${index + 1}`,
        body: part.replace(/💡 Tip:|Tip \d:|1\.|2\./, "").trim(),
        kind: "tip"
      } as AIInsight));
    }

    return [
      {
        id: "insight_1",
        title: "AI Analysis",
        body: rawText.replace(/💡 Tip:/, "").trim(),
        kind: "tip",
      } as unknown as AIInsight,
    ];
  },
};
