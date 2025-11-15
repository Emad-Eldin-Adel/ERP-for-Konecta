using FinanceService.Models;

namespace FinanceService.Services.Abstractions;

public interface IBudgetService
{
    Task<IReadOnlyList<BudgetCycle>> ListAsync(CancellationToken cancellationToken);
    Task<BudgetCycle> GetAsync(long id, CancellationToken cancellationToken);
    Task<BudgetCycle> CreateAsync(
        BudgetCycle cycle,
        IReadOnlyCollection<BudgetStageStatus>? stages,
        IReadOnlyCollection<BudgetSnapshot>? snapshots,
        CancellationToken cancellationToken);
    Task<BudgetCycle> UpdateAsync(
        long id,
        BudgetCycle cycle,
        IReadOnlyCollection<BudgetStageStatus>? stages,
        IReadOnlyCollection<BudgetSnapshot>? snapshots,
        CancellationToken cancellationToken);
    Task<BudgetStageStatus> UpdateStageAsync(long budgetId, BudgetStageStatus stage, CancellationToken cancellationToken);
    Task<BudgetSnapshot> UpsertSnapshotAsync(long budgetId, BudgetSnapshot snapshot, CancellationToken cancellationToken);
}
