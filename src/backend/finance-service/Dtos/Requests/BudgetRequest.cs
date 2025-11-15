using System.ComponentModel.DataAnnotations;

namespace FinanceService.Dtos.Requests;

public class BudgetRequest
{
    [Range(2000, 9999)]
    public int FiscalYear { get; set; }

    public decimal? AnnualTarget { get; set; }
    public decimal? ApprovedAmount { get; set; }
    public decimal? YtdActuals { get; set; }
    public decimal? LatestForecast { get; set; }
    public string? Owner { get; set; }
    public string? Notes { get; set; }
    public bool? Locked { get; set; }
    public List<BudgetStageRequest>? Stages { get; set; }
    public List<BudgetSnapshotRequest>? Snapshots { get; set; }
}

public class BudgetStageRequest
{
    [Required]
    public string Stage { get; set; } = string.Empty;

    [Required]
    public string State { get; set; } = string.Empty;

    public string? Owner { get; set; }
    public string? Notes { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class BudgetSnapshotRequest
{
    [Required]
    public string Month { get; set; } = string.Empty; // yyyy-MM

    public decimal? BudgetAmount { get; set; }
    public decimal? ActualAmount { get; set; }
    public decimal? ForecastAmount { get; set; }
    public string? Notes { get; set; }
}
