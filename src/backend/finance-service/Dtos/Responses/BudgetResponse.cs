namespace FinanceService.Dtos.Responses;

public class BudgetResponse
{
    public long Id { get; set; }
    public int FiscalYear { get; set; }
    public decimal? AnnualTarget { get; set; }
    public decimal? ApprovedAmount { get; set; }
    public decimal? YtdActuals { get; set; }
    public decimal? LatestForecast { get; set; }
    public bool IsLocked { get; set; }
    public DateTime? LockedAt { get; set; }
    public string? Owner { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public IReadOnlyList<BudgetStageResponse> Stages { get; set; } = Array.Empty<BudgetStageResponse>();
    public IReadOnlyList<BudgetSnapshotResponse> Snapshots { get; set; } = Array.Empty<BudgetSnapshotResponse>();
}

public class BudgetStageResponse
{
    public long Id { get; set; }
    public string Stage { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string? Owner { get; set; }
    public string? Notes { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class BudgetSnapshotResponse
{
    public long Id { get; set; }
    public string Month { get; set; } = string.Empty;
    public decimal? BudgetAmount { get; set; }
    public decimal? ActualAmount { get; set; }
    public decimal? ForecastAmount { get; set; }
    public decimal? Variance { get; set; }
    public string? Notes { get; set; }
}
