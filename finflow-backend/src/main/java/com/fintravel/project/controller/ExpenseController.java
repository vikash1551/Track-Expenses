package com.fintravel.project.controller;

import com.fintravel.project.dto.ExpenseDTO;
import com.fintravel.project.entity.Expense;
import com.fintravel.project.entity.User;
import com.fintravel.project.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    @Autowired
    private ExpenseRepository expenseRepository;

    // Helper method to convert Entity -> DTO
    private ExpenseDTO convertToDTO(Expense expense) {
        return ExpenseDTO.builder()
                .id(expense.getId())
                .amount(expense.getAmount())
                .category(expense.getCategory())
                .note(expense.getNote())
                .transactionDate(expense.getTransactionDate())
                .userId(expense.getUser().getId())
                .build();
    }

    // Get ONLY the expenses belonging to the logged-in user
    @GetMapping
    public List<ExpenseDTO> getMyExpenses(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        List<Expense> expenses = expenseRepository.findByUserId(user.getId());
        
        // Convert all raw expenses to clean DTOs
        return expenses.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Add an expense and return a clean DTO
    @PostMapping
    public ExpenseDTO addExpense(@RequestBody Expense expense, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        expense.setUser(user);
        
        Expense savedExpense = expenseRepository.save(expense);
        return convertToDTO(savedExpense);
    }
    // 3. Update an existing expense
    @PutMapping("/{id}")
    public ExpenseDTO updateExpense(@PathVariable Long id, @RequestBody Expense expenseDetails, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        // Find the expense
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        // Security Check: Ensure the logged-in user actually owns this expense!
        if (!expense.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to modify this expense");
        }

        // Update the fields
        expense.setAmount(expenseDetails.getAmount());
        expense.setCategory(expenseDetails.getCategory());
        expense.setNote(expenseDetails.getNote());

        Expense updatedExpense = expenseRepository.save(expense);
        return convertToDTO(updatedExpense);
    }

    // 4. Delete an expense
    @DeleteMapping("/{id}")
    public String deleteExpense(@PathVariable Long id, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        // Find the expense
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        // Security Check: Ensure the logged-in user actually owns this expense!
        if (!expense.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to delete this expense");
        }

        expenseRepository.delete(expense);
        return "Expense deleted successfully!";
    }
}
