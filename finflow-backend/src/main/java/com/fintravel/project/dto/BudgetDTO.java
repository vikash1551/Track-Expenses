package com.fintravel.project.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BudgetDTO {
    private Long id;
    private String category;
    private Double monthlyLimit;
    private Long userId;
}