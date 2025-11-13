using FinanceService.Services.Models;

namespace FinanceService.Services.Abstractions;

public interface IHrClient
{
    Task<decimal?> GetBaseSalaryAsync(long employeeId, CancellationToken cancellationToken);
    Task<long?> ResolveEmployeeIdAsync(string? bearerToken, string? subject, string? usernameClaim, CancellationToken cancellationToken);
    Task<string?> GetEmployeeEmailAsync(long employeeId, CancellationToken cancellationToken);
    Task<IReadOnlyList<HrEmployee>> GetEmployeesAsync(string? bearerToken, CancellationToken cancellationToken);
}
