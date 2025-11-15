using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinanceService.Models;

[Table("budget_stage_status")]
public class BudgetStageStatus
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Column("budget_cycle_id")]
    public long BudgetCycleId { get; set; }

    public BudgetCycle? BudgetCycle { get; set; }

    [Column("stage")]
    public BudgetStage Stage { get; set; }

    [Column("state")]
    public BudgetStageState State { get; set; } = BudgetStageState.NOT_STARTED;

    [MaxLength(128)]
    [Column("owner")]
    public string? Owner { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("started_at")]
    public DateTime? StartedAt { get; set; }

    [Column("completed_at")]
    public DateTime? CompletedAt { get; set; }
}
