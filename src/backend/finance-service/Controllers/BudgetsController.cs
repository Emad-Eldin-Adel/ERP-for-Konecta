using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Globalization;
using System.Linq;
using FinanceService.Dtos.Requests;
using FinanceService.Dtos.Responses;
using FinanceService.Models;
using FinanceService.Services.Abstractions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinanceService.Controllers;

[ApiController]
[Route("api/finance/budgets")]
public class BudgetsController(IBudgetService budgetService) : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "ADMIN,FINANCE")]
    public async Task<ActionResult<IReadOnlyList<BudgetResponse>>> List(CancellationToken cancellationToken)
    {
        var budgets = await budgetService.ListAsync(cancellationToken);
        return Ok(budgets.Select(ToResponse).ToList());
    }

    [HttpGet("{id:long}")]
    [Authorize(Roles = "ADMIN,FINANCE")]
    public async Task<ActionResult<BudgetResponse>> Get(long id, CancellationToken cancellationToken)
    {
        var budget = await budgetService.GetAsync(id, cancellationToken);
        return Ok(ToResponse(budget));
    }

    [HttpPost]
    [Authorize(Roles = "ADMIN,FINANCE")]
    public async Task<ActionResult<BudgetResponse>> Create([FromBody] BudgetRequest request, CancellationToken cancellationToken)
    {
        var entity = FromRequest(request);
        var stages = StageUpdatesFromRequest(request);
        var snapshots = SnapshotUpdatesFromRequest(request);
        var created = await budgetService.CreateAsync(entity, stages, snapshots, cancellationToken);
        return Ok(ToResponse(created));
    }

    [HttpPut("{id:long}")]
    [Authorize(Roles = "ADMIN,FINANCE")]
    public async Task<ActionResult<BudgetResponse>> Update(long id, [FromBody] BudgetRequest request, CancellationToken cancellationToken)
    {
        var entity = FromRequest(request);
        var stages = StageUpdatesFromRequest(request);
        var snapshots = SnapshotUpdatesFromRequest(request);
        var updated = await budgetService.UpdateAsync(id, entity, stages, snapshots, cancellationToken);
        return Ok(ToResponse(updated));
    }

    [HttpPut("{id:long}/stages")]
    [Authorize(Roles = "ADMIN,FINANCE")]
    public async Task<ActionResult<BudgetStageResponse>> UpdateStage(long id, [FromBody] BudgetStageRequest request, CancellationToken cancellationToken)
    {
        var stage = StageUpdateFromRequest(request);
        var updated = await budgetService.UpdateStageAsync(id, stage, cancellationToken);
        return Ok(ToStageResponse(updated));
    }

    [HttpPut("{id:long}/snapshots")]
    [Authorize(Roles = "ADMIN,FINANCE")]
    public async Task<ActionResult<BudgetSnapshotResponse>> UpsertSnapshot(long id, [FromBody] BudgetSnapshotRequest request, CancellationToken cancellationToken)
    {
        var snapshot = SnapshotFromRequest(request);
        var updated = await budgetService.UpsertSnapshotAsync(id, snapshot, cancellationToken);
        return Ok(ToSnapshotResponse(updated));
    }

    private static BudgetCycle FromRequest(BudgetRequest request) => new()
    {
        FiscalYear = request.FiscalYear,
        AnnualTarget = request.AnnualTarget,
        ApprovedAmount = request.ApprovedAmount,
        YtdActuals = request.YtdActuals,
        LatestForecast = request.LatestForecast,
        Owner = request.Owner,
        Notes = request.Notes,
        IsLocked = request.Locked ?? false,
    };

    private static IReadOnlyCollection<BudgetStageStatus>? StageUpdatesFromRequest(BudgetRequest request) =>
        request.Stages?.Select(StageUpdateFromRequest).ToList();

    private static BudgetStageStatus StageUpdateFromRequest(BudgetStageRequest request)
    {
        var stage = ParseEnum<BudgetStage>(request.Stage, nameof(request.Stage));
        var state = ParseEnum<BudgetStageState>(request.State, nameof(request.State));
        return new BudgetStageStatus
        {
            Stage = stage,
            State = state,
            Owner = request.Owner,
            Notes = request.Notes,
            StartedAt = request.StartedAt,
            CompletedAt = request.CompletedAt
        };
    }

    private static IReadOnlyCollection<BudgetSnapshot>? SnapshotUpdatesFromRequest(BudgetRequest request) =>
        request.Snapshots?.Select(SnapshotFromRequest).ToList();

    private static BudgetSnapshot SnapshotFromRequest(BudgetSnapshotRequest request) => new()
    {
        Month = ParseMonth(request.Month),
        BudgetAmount = request.BudgetAmount,
        ActualAmount = request.ActualAmount,
        ForecastAmount = request.ForecastAmount,
        Notes = request.Notes
    };

    private static DateOnly ParseMonth(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new ValidationException("Month is required.");
        }

        var trimmed = value.Trim();
        if (trimmed.Length == 7)
        {
            trimmed += "-01";
        }

        if (DateOnly.TryParse(trimmed, CultureInfo.InvariantCulture, DateTimeStyles.None, out var dateOnly))
        {
            return new DateOnly(dateOnly.Year, dateOnly.Month, 1);
        }

        if (DateTime.TryParse(trimmed, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out var parsedDateTime))
        {
            return new DateOnly(parsedDateTime.Year, parsedDateTime.Month, 1);
        }

        throw new ValidationException($"Invalid month '{value}'. Use YYYY-MM.");
    }

    private static T ParseEnum<T>(string value, string fieldName) where T : struct
    {
        if (Enum.TryParse<T>(value, true, out var parsed))
        {
            return parsed;
        }
        throw new ValidationException($"Invalid {fieldName} '{value}'.");
    }

    private static BudgetResponse ToResponse(BudgetCycle cycle)
    {
        var orderedStages = BudgetStageMetadata.Stages;
        var stageLookup = (cycle.Stages ?? new List<BudgetStageStatus>())
            .GroupBy(status => status.Stage)
            .ToDictionary(group => group.Key, group => group.First());
        var stageResponses = orderedStages
            .Select(item => stageLookup.TryGetValue(item.Stage, out var status)
                ? ToStageResponse(status)
                : ToStageResponse(new BudgetStageStatus { Stage = item.Stage }))
            .ToList();

        return new BudgetResponse
        {
            Id = cycle.Id,
            FiscalYear = cycle.FiscalYear,
            AnnualTarget = cycle.AnnualTarget,
            ApprovedAmount = cycle.ApprovedAmount,
            YtdActuals = cycle.YtdActuals,
            LatestForecast = cycle.LatestForecast,
            IsLocked = cycle.IsLocked,
            LockedAt = cycle.LockedAt,
            Owner = cycle.Owner,
            Notes = cycle.Notes,
            CreatedAt = cycle.CreatedAt,
            UpdatedAt = cycle.UpdatedAt,
            Stages = stageResponses,
            Snapshots = (cycle.Snapshots ?? new List<BudgetSnapshot>())
                .OrderBy(snapshot => snapshot.Month)
                .Select(ToSnapshotResponse)
                .ToList()
        };
    }

    private static BudgetStageResponse ToStageResponse(BudgetStageStatus status) => new()
    {
        Id = status.Id,
        Stage = status.Stage.ToString(),
        Label = status.Stage.GetLabel(),
        State = status.State.ToString(),
        Owner = status.Owner,
        Notes = status.Notes,
        StartedAt = status.StartedAt,
        CompletedAt = status.CompletedAt
    };

    private static BudgetSnapshotResponse ToSnapshotResponse(BudgetSnapshot snapshot)
    {
        decimal? variance = null;
        if (snapshot.BudgetAmount.HasValue || snapshot.ActualAmount.HasValue)
        {
            variance = (snapshot.ActualAmount ?? 0) - (snapshot.BudgetAmount ?? 0);
        }

        return new BudgetSnapshotResponse
        {
            Id = snapshot.Id,
            Month = $"{snapshot.Month.Year:D4}-{snapshot.Month.Month:D2}",
            BudgetAmount = snapshot.BudgetAmount,
            ActualAmount = snapshot.ActualAmount,
            ForecastAmount = snapshot.ForecastAmount,
            Variance = variance,
            Notes = snapshot.Notes
        };
    }
}
