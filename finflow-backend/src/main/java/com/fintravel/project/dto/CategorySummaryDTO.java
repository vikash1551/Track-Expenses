package com.fintravel.project.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategorySummaryDTO {
    private String category;
    private Double monthlyLimit;
    private Double spentThisMonth;
    private Double remaining;
    private String warningMessage; // e.g., "Safe", "Approaching Limit", "OVERSPENT!"
}