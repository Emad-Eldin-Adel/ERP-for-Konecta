using FinanceService.Data;
using FinanceService.Models;
using FinanceService.Services.Abstractions;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading;

namespace FinanceService.Services;

public class BudgetService(FinanceDbContext dbContext) : IBudgetService
{
    private static readonly SemaphoreSlim SchemaLock = new(1, 1);
    private static bool SchemaEnsured;

    public async Task<IReadOnlyList<BudgetCycle>> ListAsync(CancellationToken cancellationToken)
    {
        await EnsureSchemaAsync(cancellationToken);

        return await dbContext.BudgetCycles
            .Include(cycle => cycle.Stages)
            .Include(cycle => cycle.Snapshots)
            .OrderByDescending(cycle => cycle.FiscalYear)
            .ThenByDescending(cycle => cycle.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<BudgetCycle> GetAsync(long id, CancellationToken cancellationToken)
    {
        await EnsureSchemaAsync(cancellationToken);

        var cycle = await dbContext.BudgetCycles
            .Include(item => item.Stages)
            .Include(item => item.Snapshots)
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (cycle == null)
        {
            throw new KeyNotFoundException($"Budget cycle {id} not found.");
        }

        return cycle;
    }

    public async Task<BudgetCycle> CreateAsync(
        BudgetCycle cycle,
        IReadOnlyCollection<BudgetStageStatus>? stages,
        IReadOnlyCollection<BudgetSnapshot>? snapshots,
        CancellationToken cancellationToken)
    {
        await EnsureSchemaAsync(cancellationToken);

        ApplyStageUpdates(cycle, cycle.Stages, stages);
        ApplySnapshotUpdates(cycle, cycle.Snapshots, snapshots);
        dbContext.BudgetCycles.Add(cycle);
        await dbContext.SaveChangesAsync(cancellationToken);
        return cycle;
    }

    public async Task<BudgetCycle> UpdateAsync(
        long id,
        BudgetCycle updated,
        IReadOnlyCollection<BudgetStageStatus>? stages,
        IReadOnlyCollection<BudgetSnapshot>? snapshots,
        CancellationToken cancellationToken)
    {
        await EnsureSchemaAsync(cancellationToken);

        var existing = await dbContext.BudgetCycles
            .Include(item => item.Stages)
            .Include(item => item.Snapshots)
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException($"Budget cycle {id} not found.");

        existing.FiscalYear = updated.FiscalYear;
        existing.AnnualTarget = updated.AnnualTarget;
        existing.ApprovedAmount = updated.ApprovedAmount;
        existing.YtdActuals = updated.YtdActuals;
        existing.LatestForecast = updated.LatestForecast;
        existing.Owner = updated.Owner;
        existing.Notes = updated.Notes;
        existing.IsLocked = updated.IsLocked;
        existing.LockedAt = updated.IsLocked ? (existing.LockedAt ?? DateTime.UtcNow) : null;
        existing.UpdatedAt = DateTime.UtcNow;

        ApplyStageUpdates(existing, existing.Stages, stages);
        ApplySnapshotUpdates(existing, existing.Snapshots, snapshots);

        await dbContext.SaveChangesAsync(cancellationToken);
        return existing;
    }

    public async Task<BudgetStageStatus> UpdateStageAsync(
        long budgetId,
        BudgetStageStatus stage,
        CancellationToken cancellationToken)
    {
        await EnsureSchemaAsync(cancellationToken);

        var cycle = await dbContext.BudgetCycles
            .Include(item => item.Stages)
            .FirstOrDefaultAsync(item => item.Id == budgetId, cancellationToken)
            ?? throw new KeyNotFoundException($"Budget cycle {budgetId} not found.");

        ApplyStageUpdates(cycle, cycle.Stages, new[] { stage });
        cycle.UpdatedAt = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        return cycle.Stages.First(s => s.Stage == stage.Stage);
    }

    public async Task<BudgetSnapshot> UpsertSnapshotAsync(
        long budgetId,
        BudgetSnapshot snapshot,
        CancellationToken cancellationToken)
    {
        await EnsureSchemaAsync(cancellationToken);

        var cycle = await dbContext.BudgetCycles
            .Include(item => item.Snapshots)
            .FirstOrDefaultAsync(item => item.Id == budgetId, cancellationToken)
            ?? throw new KeyNotFoundException($"Budget cycle {budgetId} not found.");

        ApplySnapshotUpdates(cycle, cycle.Snapshots, new[] { snapshot });
        cycle.UpdatedAt = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        return cycle.Snapshots.First(s => s.Month == snapshot.Month);
    }

    private static void ApplyStageUpdates(
        BudgetCycle cycle,
        ICollection<BudgetStageStatus> existing,
        IReadOnlyCollection<BudgetStageStatus>? updates)
    {
        if (existing.Count == 0)
        {
            foreach (var stage in BudgetStageMetadata.EnumerateStages())
            {
                existing.Add(new BudgetStageStatus
                {
                    BudgetCycle = cycle,
                    Stage = stage,
                    State = BudgetStageState.NOT_STARTED
                });
            }
        }

        if (updates == null || updates.Count == 0)
        {
            return;
        }

        var map = existing.ToDictionary(status => status.Stage);
        foreach (var update in updates)
        {
            if (!map.TryGetValue(update.Stage, out var target))
            {
                target = new BudgetStageStatus
                {
                    BudgetCycle = cycle,
                    Stage = update.Stage
                };
                existing.Add(target);
                map[update.Stage] = target;
            }

            target.State = update.State;
            target.Owner = update.Owner;
            target.Notes = update.Notes;
            target.StartedAt = update.StartedAt;
            target.CompletedAt = update.CompletedAt;
        }
    }

    private static void ApplySnapshotUpdates(
        BudgetCycle cycle,
        ICollection<BudgetSnapshot> existing,
        IReadOnlyCollection<BudgetSnapshot>? updates)
    {
        if (updates == null || updates.Count == 0)
        {
            return;
        }

        var map = existing.ToDictionary(snapshot => snapshot.Month);
        foreach (var update in updates)
        {
            if (!map.TryGetValue(update.Month, out var target))
            {
                target = new BudgetSnapshot
                {
                    BudgetCycle = cycle,
                    Month = update.Month,
                    CreatedAt = DateTime.UtcNow
                };
                existing.Add(target);
                map[update.Month] = target;
            }

            target.BudgetAmount = update.BudgetAmount;
            target.ActualAmount = update.ActualAmount;
            target.ForecastAmount = update.ForecastAmount;
            target.Notes = update.Notes;

            if (target.CreatedAt == default)
            {
                target.CreatedAt = DateTime.UtcNow;
            }
        }
    }

    private async Task EnsureSchemaAsync(CancellationToken cancellationToken)
    {
        if (SchemaEnsured)
        {
            return;
        }

        await SchemaLock.WaitAsync(cancellationToken);
        try
        {
            if (!SchemaEnsured)
            {
                await dbContext.Database.MigrateAsync(cancellationToken);
                SchemaEnsured = true;
            }
        }
        finally
        {
            SchemaLock.Release();
        }
    }
}
