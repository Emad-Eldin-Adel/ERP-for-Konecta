package com.example.report_service.clients.finance.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.Instant;

@JsonIgnoreProperties(ignoreUnknown = true)
public record BudgetStageResponse(
        Long id,
        String stage,
        String label,
        String state,
        String owner,
        String notes,
        Instant startedAt,
        Instant completedAt) {
}
