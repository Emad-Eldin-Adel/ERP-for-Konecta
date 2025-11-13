using FinanceService.Dtos.Requests;
using FinanceService.Models;

namespace FinanceService.Services.Abstractions;

public interface IPayrollService
{
    Task<Payroll> CalculateAndSaveAsync(PayrollRequest request, CancellationToken cancellationToken);
    Task<Payroll?> GetByEmployeeAndPeriodAsync(long employeeId, string period, CancellationToken cancellationToken);
    Task<IReadOnlyList<Payroll>> FindByPeriodAsync(string period, CancellationToken cancellationToken);
}
