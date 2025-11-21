package com.example.report_service.clients.finance.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;

@JsonIgnoreProperties(ignoreUnknown = true)
public record BudgetSnapshotResponse(
        Long id,
        String month,
        BigDecimal budgetAmount,
        BigDecimal actualAmount,
        BigDecimal forecastAmount,
        BigDecimal variance,
        String notes) {
}
