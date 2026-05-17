package com.fintravel.project.repository;

import com.fintravel.project.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    // Custom query to find expenses by a specific user's ID
    List<Expense> findByUserId(Long userId);
    // Fetch expenses within a specific date range (like the current month)
    List<Expense> findByUserIdAndTransactionDateBetween(Long userId, java.time.LocalDateTime startDate, java.time.LocalDateTime endDate);
}