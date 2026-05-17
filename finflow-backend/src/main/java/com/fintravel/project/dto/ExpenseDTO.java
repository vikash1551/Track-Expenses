package com.fintravel.project.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ExpenseDTO {
    private Long id;
    private Double amount;
    private String category;
    private String note;
    private LocalDateTime transactionDate;
    private Long userId; // Just the ID, not the whole User object!
}