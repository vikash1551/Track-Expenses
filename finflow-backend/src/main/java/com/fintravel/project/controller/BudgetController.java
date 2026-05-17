package com.fintravel.project.controller;

import com.fintravel.project.dto.BudgetDTO;
import com.fintravel.project.entity.Budget;
import com.fintravel.project.entity.User;
import com.fintravel.project.repository.BudgetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    @Autowired
    private BudgetRepository budgetRepository;

    private BudgetDTO convertToDTO(Budget budget) {
        return BudgetDTO.builder()
                .id(budget.getId())
                .category(budget.getCategory())
                .monthlyLimit(budget.getMonthlyLimit())
                .userId(budget.getUser().getId())
                .build();
    }

    @GetMapping
    public List<BudgetDTO> getMyBudgets(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return budgetRepository.findByUserId(user.getId())
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @PostMapping
    public BudgetDTO setBudget(@RequestBody Budget budgetDetails, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        // Check if a budget for this category already exists for this user
        Budget budget = budgetRepository.findByUserIdAndCategory(user.getId(), budgetDetails.getCategory())
                .orElse(new Budget()); // If not, create a new one

        budget.setUser(user);
        budget.setCategory(budgetDetails.getCategory());
        budget.setMonthlyLimit(budgetDetails.getMonthlyLimit());

        Budget savedBudget = budgetRepository.save(budget);
        return convertToDTO(savedBudget);
    }
}