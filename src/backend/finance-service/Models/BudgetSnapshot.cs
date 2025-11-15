using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinanceService.Models;

[Table("budget_snapshots")]
public class BudgetSnapshot
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Column("budget_cycle_id")]
    public long BudgetCycleId { get; set; }

    public BudgetCycle? BudgetCycle { get; set; }

    [Column("month")]
    public DateOnly Month { get; set; }

    [Column("budget_amount")]
    public decimal? BudgetAmount { get; set; }

    [Column("actual_amount")]
    public decimal? ActualAmount { get; set; }

    [Column("forecast_amount")]
    public decimal? ForecastAmount { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
