package com.fintravel.project.controller;

import com.fintravel.project.dto.CategorySummaryDTO;
import com.fintravel.project.dto.DashboardSummaryDTO;
import com.fintravel.project.entity.Budget;
import com.fintravel.project.entity.Expense;
import com.fintravel.project.entity.User;
import com.fintravel.project.repository.BudgetRepository;
import com.fintravel.project.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @GetMapping("/summary")
    public DashboardSummaryDTO getDashboardSummary(Authentication authentication) {
        User user = (User) authentication.getPrincipal();

        // 1. Figure out the start and end of the current month
        YearMonth currentMonth = YearMonth.now();
        LocalDateTime startOfMonth = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime endOfMonth = currentMonth.atEndOfMonth().atTime(23, 59, 59);

        // 2. Fetch User's Data for the month
        List<Budget> budgets = budgetRepository.findByUserId(user.getId());
        List<Expense> expenses = expenseRepository.findByUserIdAndTransactionDateBetween(user.getId(), startOfMonth, endOfMonth);

        // 3. Group all expenses by Category and sum them up
        Map<String, Double> spentByCategory = expenses.stream()
                .collect(Collectors.groupingBy(
                        Expense::getCategory,
                        Collectors.summingDouble(Expense::getAmount)
                ));

        List<CategorySummaryDTO> categorySummaries = new ArrayList<>();
        double totalBudget = 0.0;
        double totalSpent = expenses.stream().mapToDouble(Expense::getAmount).sum();

        // 4. Calculate limits and generate warnings
        for (Budget budget : budgets) {
            String category = budget.getCategory();
            double limit = budget.getMonthlyLimit();
            double spent = spentByCategory.getOrDefault(category, 0.0);
            double remaining = limit - spent;
            
            totalBudget += limit;
            
            // The Intelligence Engine
            String warning = "Safe ✅";
            if (spent >= limit) {
                warning = "OVERSPENT! 🚨";
            } else if (spent >= limit * 0.8) {
                warning = "Approaching Limit ⚠️";
            }

            categorySummaries.add(CategorySummaryDTO.builder()
                    .category(category)
                    .monthlyLimit(limit)
                    .spentThisMonth(spent)
                    .remaining(remaining)
                    .warningMessage(warning)
                    .build());
        }

        return DashboardSummaryDTO.builder()
                .totalMonthlyBudget(totalBudget)
                .totalMonthlySpent(totalSpent)
                .totalRemaining(totalBudget - totalSpent)
                .categorySummaries(categorySummaries)
                .build();
    }
}