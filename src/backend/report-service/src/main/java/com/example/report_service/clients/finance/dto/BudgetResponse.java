package com.example.report_service.clients.finance.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record BudgetResponse(
        Long id,
        Integer fiscalYear,
        BigDecimal annualTarget,
        BigDecimal approvedAmount,
        BigDecimal ytdActuals,
        BigDecimal latestForecast,
        Boolean isLocked,
        Instant lockedAt,
        String owner,
        String notes,
        Instant createdAt,
        Instant updatedAt,
        List<BudgetStageResponse> stages,
        List<BudgetSnapshotResponse> snapshots) {

    @JsonCreator
    public BudgetResponse(
            @JsonProperty("id") Long id,
            @JsonProperty("fiscalYear") Integer fiscalYear,
            @JsonProperty("annualTarget") BigDecimal annualTarget,
            @JsonProperty("approvedAmount") BigDecimal approvedAmount,
            @JsonProperty("ytdActuals") BigDecimal ytdActuals,
            @JsonProperty("latestForecast") BigDecimal latestForecast,
            @JsonProperty("isLocked") Boolean isLocked,
            @JsonProperty("lockedAt") Instant lockedAt,
            @JsonProperty("owner") String owner,
            @JsonProperty("notes") String notes,
            @JsonProperty("createdAt") Instant createdAt,
            @JsonProperty("updatedAt") Instant updatedAt,
            @JsonProperty("stages") List<BudgetStageResponse> stages,
            @JsonProperty("snapshots") List<BudgetSnapshotResponse> snapshots) {
        this.id = id;
        this.fiscalYear = fiscalYear;
        this.annualTarget = annualTarget;
        this.approvedAmount = approvedAmount;
        this.ytdActuals = ytdActuals;
        this.latestForecast = latestForecast;
        this.isLocked = isLocked;
        this.lockedAt = lockedAt;
        this.owner = owner;
        this.notes = notes;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.stages = stages == null ? List.of() : List.copyOf(stages);
        this.snapshots = snapshots == null ? List.of() : List.copyOf(snapshots);
    }
}
