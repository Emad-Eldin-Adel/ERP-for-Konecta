using FinanceService.Data;
using FinanceService.Models;
using FinanceService.Services.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace FinanceService.Services;

public class ExpenseService(FinanceDbContext dbContext) : IExpenseService
{
    public async Task<Expense> SubmitAsync(Expense expense, CancellationToken cancellationToken)
    {
        expense.Status = ExpenseStatus.PENDING;
        expense.Source = ExpenseSource.USER;
        expense.CreatedAt = DateTime.UtcNow;
        dbContext.Expenses.Add(expense);
        await dbContext.SaveChangesAsync(cancellationToken);
        return expense;
    }

    public async Task<Expense> ApproveAsync(long id, long approverId, CancellationToken cancellationToken)
    {
        var expense = await dbContext.Expenses.FirstOrDefaultAsync(e => e.Id == id, cancellationToken)
                      ?? throw new KeyNotFoundException($"Expense {id} not found");
        expense.Status = ExpenseStatus.APPROVED;
        expense.ApprovedBy = approverId;
        await dbContext.SaveChangesAsync(cancellationToken);
        return expense;
    }

    public async Task<Expense> RejectAsync(long id, long approverId, CancellationToken cancellationToken)
    {
        var expense = await dbContext.Expenses.FirstOrDefaultAsync(e => e.Id == id, cancellationToken)
                      ?? throw new KeyNotFoundException($"Expense {id} not found");
        expense.Status = ExpenseStatus.REJECTED;
        expense.ApprovedBy = approverId;
        await dbContext.SaveChangesAsync(cancellationToken);
        return expense;
    }

    public async Task<IReadOnlyList<Expense>> BySubmitterAsync(long employeeId, CancellationToken cancellationToken) =>
        await dbContext.Expenses.Where(e => e.SubmittedBy == employeeId).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Expense>> ByStatusAsync(ExpenseStatus status, CancellationToken cancellationToken) =>
        await dbContext.Expenses.Where(e => e.Status == status).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Expense>> ListAllAsync(CancellationToken cancellationToken) =>
        await dbContext.Expenses.ToListAsync(cancellationToken);
}
