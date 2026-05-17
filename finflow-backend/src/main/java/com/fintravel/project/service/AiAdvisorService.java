package com.fintravel.project.service;

import com.fintravel.project.entity.Budget;
import com.fintravel.project.entity.Expense;
import com.fintravel.project.repository.BudgetRepository;
import com.fintravel.project.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.text.NumberFormat;
import java.util.Locale;
import java.util.List;

@Service
public class AiAdvisorService {

    // Pulls the key from application.properties, defaults to dummy_key
    @Value("${openai.api.key:dummy_key}") 
    private String apiKey;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    public String generateInsights(Long userId) {
        YearMonth currentMonth = YearMonth.now();
        LocalDateTime startOfMonth = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime endOfMonth = currentMonth.atEndOfMonth().atTime(23, 59, 59);

        List<Budget> budgets = budgetRepository.findByUserId(userId);
        List<Expense> expenses = expenseRepository.findByUserIdAndTransactionDateBetween(userId, startOfMonth, endOfMonth);

        double totalSpent = expenses.stream().mapToDouble(Expense::getAmount).sum();
        double totalBudget = budgets.stream().mapToDouble(Budget::getMonthlyLimit).sum();

        // 🧠 THE MOCK AI INTERCEPTOR 🧠
        // If we don't have a real key, use our local logic so the app doesn't crash!
        if ("dummy_key".equals(apiKey) || apiKey.isBlank()) {
            return generateMockInsight(totalBudget, totalSpent);
        }

        // --- REAL OPENAI CALL (Only runs if you put a real key in application.properties) ---
        String prompt = String.format(
            "You are an expert financial advisor. The user is from India and uses Indian Rupees (₹). They have a total budget of ₹%.2f and has spent ₹%.2f this month. " +
            "Their expenses are: %s. Give them 2 actionable, highly specific tips on how to save money based on their exact spending categories. Keep it brief. Always use the ₹ symbol for amounts.",
            totalBudget, totalSpent, expenses.toString()
        );

        try {
            String cleanPrompt = prompt.replace("\"", "\\\"");
            String requestBody = """
                {
                    "model": "gpt-3.5-turbo",
                    "messages": [{"role": "user", "content": "%s"}]
                }
                """.formatted(cleanPrompt);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
            return response.body(); 
        } catch (Exception e) {
            return "AI Service Unavailable: " + e.getMessage();
        }
    }

    // Our local "AI" logic
    private String generateMockInsight(double budget, double spent) {
        if (budget == 0) return "💡 Tip: You haven't set a budget yet! Setting a strict budget is the first step to saving money.";
        if (spent > budget) return "💡 Tip: You are over budget! To save money next month, try using the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings.";
        if (spent > budget * 0.8) return "💡 Tip: You're close to your limit. Save money by cooking at home this week and avoiding non-essential online shopping.";
        
        return "💡 Tip: You're doing great! Consider transferring your remaining budget into a high-yield savings account or mutual fund at the end of the month.";
    }
}