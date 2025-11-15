using System.Collections.ObjectModel;
using System.Linq;

namespace FinanceService.Models;

public enum BudgetStage
{
    ANNUAL_TARGET,
    DEPARTMENT_PROPOSALS,
    CONSOLIDATION_REVIEW,
    HISTORICAL_COMPARISON,
    FINAL_APPROVAL,
    SYSTEM_UPLOAD_LOCK,
    MONTHLY_TRACKING,
    FORECAST_REALLOCATION
}

public enum BudgetStageState
{
    NOT_STARTED,
    IN_PROGRESS,
    WAITING,
    COMPLETED
}

public static class BudgetStageMetadata
{
    private static readonly IReadOnlyList<(BudgetStage Stage, string Label)> OrderedStages =
        new ReadOnlyCollection<(BudgetStage, string)>(
            new List<(BudgetStage, string)>
            {
                (BudgetStage.ANNUAL_TARGET, "Define Annual Budget Target"),
                (BudgetStage.DEPARTMENT_PROPOSALS, "Department Budget Proposals"),
                (BudgetStage.CONSOLIDATION_REVIEW, "Finance Consolidation & Review"),
                (BudgetStage.HISTORICAL_COMPARISON, "Compare with Historical Data & Forecasts"),
                (BudgetStage.FINAL_APPROVAL, "Finalize Approved Budget"),
                (BudgetStage.SYSTEM_UPLOAD_LOCK, "System Upload & Lock Budget"),
                (BudgetStage.MONTHLY_TRACKING, "Monthly Budget vs Actual Tracking"),
                (BudgetStage.FORECAST_REALLOCATION, "Forecast Updates & Reallocation")
            });

    public static IReadOnlyList<(BudgetStage Stage, string Label)> Stages => OrderedStages;

    public static IEnumerable<BudgetStage> EnumerateStages() => OrderedStages.Select(item => item.Stage);

    public static string GetLabel(this BudgetStage stage)
    {
        foreach (var item in OrderedStages)
        {
            if (item.Stage == stage)
            {
                return item.Label;
            }
        }
        return stage.ToString().Replace('_', ' ');
    }
}
