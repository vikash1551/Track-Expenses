package com.fintravel.project.repository;

import com.fintravel.project.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUserId(Long userId);
    
    // This helps us check if a user already has a budget for a specific category
    Optional<Budget> findByUserIdAndCategory(Long userId, String category);
}