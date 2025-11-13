using FinanceService.Models;

namespace FinanceService.Services.Abstractions;

public interface IExpenseService
{
    Task<Expense> SubmitAsync(Expense expense, CancellationToken cancellationToken);
    Task<Expense> ApproveAsync(long id, long approverId, CancellationToken cancellationToken);
    Task<Expense> RejectAsync(long id, long approverId, CancellationToken cancellationToken);
    Task<IReadOnlyList<Expense>> BySubmitterAsync(long employeeId, CancellationToken cancellationToken);
    Task<IReadOnlyList<Expense>> ByStatusAsync(ExpenseStatus status, CancellationToken cancellationToken);
    Task<IReadOnlyList<Expense>> ListAllAsync(CancellationToken cancellationToken);
}
