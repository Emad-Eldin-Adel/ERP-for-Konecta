using FinanceService.Dtos.Requests;
using FinanceService.Dtos.Responses;
using FinanceService.Models;
using FinanceService.Services.Abstractions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace FinanceService.Controllers;

[ApiController]
[Route("api/finance/expenses")]
public class ExpensesController(
    IExpenseService expenseService,
    IExpenseImportService expenseImportService,
    IJwtTokenService jwtTokenService) : ControllerBase
{
    [HttpPost]
    [Authorize(Roles = "ADMIN,FINANCE,EMPLOYEE")]
    public async Task<ActionResult<ExpenseResponse>> Submit([FromBody] ExpenseRequest request, CancellationToken cancellationToken)
    {
        var expense = await expenseService.SubmitAsync(new Models.Expense
        {
            SubmittedBy = request.SubmittedBy,
            Category = request.Category,
            Amount = request.Amount,
            Description = request.Description
        }, cancellationToken);

        return Ok(ToResponse(expense));
    }

    [HttpPut("{id:long}/approve")]
    [Authorize(Roles = "ADMIN,FINANCE")]
    public async Task<ActionResult<ExpenseResponse>> Approve(long id, [FromQuery] long approverId, CancellationToken cancellationToken)
    {
        var expense = await expenseService.ApproveAsync(id, approverId, cancellationToken);
        return Ok(ToResponse(expense));
    }

    [HttpPut("{id:long}/reject")]
    [Authorize(Roles = "ADMIN,FINANCE")]
    public async Task<ActionResult<ExpenseResponse>> Reject(long id, [FromQuery] long approverId, CancellationToken cancellationToken)
    {
        var expense = await expenseService.RejectAsync(id, approverId, cancellationToken);
        return Ok(ToResponse(expense));
    }

    [HttpGet("by-submitter/{employeeId:long}")]
    [Authorize(Roles = "ADMIN,FINANCE,EMPLOYEE")]
    public async Task<ActionResult<IReadOnlyList<ExpenseResponse>>> BySubmitter(long employeeId, CancellationToken cancellationToken)
    {
        var expenses = await expenseService.BySubmitterAsync(employeeId, cancellationToken);
        return Ok(expenses.Select(ToResponse).ToList());
    }

    [HttpGet]
    [Authorize(Roles = "ADMIN,FINANCE")]
    public async Task<ActionResult<IReadOnlyList<ExpenseResponse>>> ByStatus([FromQuery] ExpenseStatus? status, CancellationToken cancellationToken)
    {
        IReadOnlyList<Models.Expense> expenses = status == null
            ? await expenseService.ListAllAsync(cancellationToken)
            : await expenseService.ByStatusAsync(status.Value, cancellationToken);

        return Ok(expenses.Select(ToResponse).ToList());
    }

    [HttpPost("import")]
    [Authorize(Roles = "ADMIN,FINANCE,HR")]
    [RequestSizeLimit(40_000_000)]
    public async Task<ActionResult<ImportSummary>> Import([FromForm] IFormFile file, [FromQuery] ExpenseStatus status = ExpenseStatus.APPROVED,
        [FromQuery] string dateFormat = "M/d/yyyy", [FromQuery] string mode = "upsert", CancellationToken cancellationToken = default)
    {
        var summary = await expenseImportService.ImportAsync(file, dateFormat, status, mode, ExtractUserId(), cancellationToken);
        return Ok(summary);
    }

    [HttpPost("import-bin")]
    [Authorize(Roles = "ADMIN,FINANCE,HR")]
    public async Task<ActionResult<ImportSummary>> ImportBinary([FromBody] byte[] body,
        [FromHeader(Name = "X-Filename")] string? filename,
        [FromQuery] ExpenseStatus status = ExpenseStatus.APPROVED,
        [FromQuery] string dateFormat = "M/d/yyyy",
        [FromQuery] string mode = "upsert",
        CancellationToken cancellationToken = default)
    {
        var summary = await expenseImportService.ImportAsync(body, filename, dateFormat, status, mode, ExtractUserId(), cancellationToken);
        return Ok(summary);
    }

    private long? ExtractUserId()
    {
        if (!Request.Headers.TryGetValue("Authorization", out var header))
        {
            return null;
        }

        var value = header.FirstOrDefault();
        if (string.IsNullOrWhiteSpace(value)) return null;
        var token = value.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase) ? value[7..] : value;
        return jwtTokenService.GetUserId(token);
    }

    private static ExpenseResponse ToResponse(Models.Expense expense) => new()
    {
        Id = expense.Id,
        SubmittedBy = expense.SubmittedBy,
        Category = expense.Category,
        Amount = expense.Amount,
        Description = expense.Description,
        Status = expense.Status,
        ApprovedBy = expense.ApprovedBy,
        CreatedAt = expense.CreatedAt,
        Department = expense.Department,
        ExpenseDate = expense.ExpenseDate
    };
}
