using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinanceService.Models;

[Table("budget_cycles")]
public class BudgetCycle
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Column("fiscal_year")]
    public int FiscalYear { get; set; }

    [Column("annual_target")]
    public decimal? AnnualTarget { get; set; }

    [Column("approved_amount")]
    public decimal? ApprovedAmount { get; set; }

    [Column("ytd_actuals")]
    public decimal? YtdActuals { get; set; }

    [Column("latest_forecast")]
    public decimal? LatestForecast { get; set; }

    [MaxLength(128)]
    [Column("owner")]
    public string? Owner { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("is_locked")]
    public bool IsLocked { get; set; }

    [Column("locked_at")]
    public DateTime? LockedAt { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public List<BudgetStageStatus> Stages { get; set; } = new();

    public List<BudgetSnapshot> Snapshots { get; set; } = new();
}
