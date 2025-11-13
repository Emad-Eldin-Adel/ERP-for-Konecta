using FinanceService.Data;
using FinanceService.Dtos.Requests;
using FinanceService.Models;
using FinanceService.Services.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace FinanceService.Services;

public class PayrollService(FinanceDbContext dbContext, IHrClient hrClient) : IPayrollService
{
    public async Task<Payroll> CalculateAndSaveAsync(PayrollRequest request, CancellationToken cancellationToken)
    {
        var baseSalary = request.BaseSalary
                         ?? await hrClient.GetBaseSalaryAsync(request.EmployeeId, cancellationToken)
                         ?? 0m;
        var bonuses = request.Bonuses ?? 0m;
        var deductions = request.Deductions ?? 0m;
        var net = baseSalary + bonuses - deductions;

        var payroll = await dbContext.Payroll
            .Where(p => p.EmployeeId == request.EmployeeId && p.Period == request.Period)
            .OrderByDescending(p => p.ProcessedDate)
            .ThenByDescending(p => p.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (payroll == null)
        {
            payroll = new Payroll
            {
                EmployeeId = request.EmployeeId,
                Period = request.Period
            };
            dbContext.Payroll.Add(payroll);
        }

        payroll.BaseSalary = baseSalary;
        payroll.Bonuses = bonuses;
        payroll.Deductions = deductions;
        payroll.NetSalary = net;
        payroll.ProcessedDate = DateOnly.FromDateTime(DateTime.UtcNow);

        await dbContext.SaveChangesAsync(cancellationToken);
        return payroll;
    }

    public async Task<Payroll?> GetByEmployeeAndPeriodAsync(long employeeId, string period, CancellationToken cancellationToken) =>
        await dbContext.Payroll
            .Where(p => p.EmployeeId == employeeId && p.Period == period)
            .OrderByDescending(p => p.ProcessedDate)
            .ThenByDescending(p => p.Id)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<IReadOnlyList<Payroll>> FindByPeriodAsync(string period, CancellationToken cancellationToken) =>
        await dbContext.Payroll.Where(p => p.Period == period).ToListAsync(cancellationToken);
}
