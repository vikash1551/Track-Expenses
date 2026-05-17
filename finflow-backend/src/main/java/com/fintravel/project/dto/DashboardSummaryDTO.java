package com.fintravel.project.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class DashboardSummaryDTO {
    private Double totalMonthlyBudget;
    private Double totalMonthlySpent;
    private Double totalRemaining;
    private List<CategorySummaryDTO> categorySummaries;
}
