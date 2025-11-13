using FinanceService.Dtos.Requests;
using FinanceService.Dtos.Responses;
using FinanceService.Models;
using FinanceService.Services.Abstractions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Security.Claims;

namespace FinanceService.Controllers;

[ApiController]
[Route("api/finance/payroll")]
public class PayrollController(
    IPayrollService payrollService,
    IAccountService accountService,
    IHrClient hrClient) : ControllerBase
{
    [HttpPost("calculate")]
    [Authorize(Roles = "ADMIN,FINANCE")]
    public async Task<ActionResult<PayrollResponse>> Calculate([FromBody] PayrollRequest request, CancellationToken cancellationToken)
    {
        var payroll = await payrollService.CalculateAndSaveAsync(request, cancellationToken);
        return Ok(ToResponse(payroll));
    }

    [HttpPost]
    [Authorize(Roles = "ADMIN,FINANCE")]
    public async Task<ActionResult<PayrollResponse>> CalculateCompat([FromBody] PayrollRequest request, CancellationToken cancellationToken)
    {
        var payroll = await payrollService.CalculateAndSaveAsync(request, cancellationToken);
        return Ok(ToResponse(payroll));
    }

    [HttpGet("employee/{employeeId:long}")]
    [Authorize(Roles = "ADMIN,FINANCE,EMPLOYEE")]
    public async Task<ActionResult<PayrollResponse>> ByEmployee(long employeeId, [FromQuery] string period, CancellationToken cancellationToken)
    {
        if (User.IsInRole("EMPLOYEE"))
        {
            var selfId = await ResolveSelfEmployeeIdAsync(cancellationToken);
            if (selfId == null || selfId != employeeId)
            {
                return Forbid();
            }
        }

        var payroll = await payrollService.GetByEmployeeAndPeriodAsync(employeeId, period, cancellationToken);
        return payroll == null ? NotFound() : Ok(ToResponse(payroll));
    }

    [HttpGet("me")]
    [Authorize(Roles = "EMPLOYEE")]
    public async Task<ActionResult<PayrollResponse>> MyPayroll([FromQuery] string period, CancellationToken cancellationToken)
    {
        var selfId = await ResolveSelfEmployeeIdAsync(cancellationToken);
        if (selfId == null)
        {
            return Forbid();
        }

        var payroll = await payrollService.GetByEmployeeAndPeriodAsync(selfId.Value, period, cancellationToken);
        if (payroll == null)
        {
            var request = new PayrollRequest
            {
                EmployeeId = selfId.Value,
                Period = period
            };
            payroll = await payrollService.CalculateAndSaveAsync(request, cancellationToken);
        }

        return Ok(ToResponse(payroll));
    }

    [HttpGet]
    [Authorize(Roles = "ADMIN,FINANCE")]
    public async Task<ActionResult<IReadOnlyList<PayrollResponse>>> ByPeriod([FromQuery] string period, CancellationToken cancellationToken)
    {
        var payrolls = await payrollService.FindByPeriodAsync(period, cancellationToken);
        return Ok(payrolls.Select(ToResponse).ToList());
    }

    [HttpGet("overview")]
    [Authorize(Roles = "ADMIN,FINANCE")]
    public async Task<ActionResult<IReadOnlyList<PayrollOverviewRow>>> Overview([FromQuery] string period, CancellationToken cancellationToken)
    {
        var bearer = Request.Headers["Authorization"].FirstOrDefault();
        var employees = await hrClient.GetEmployeesAsync(bearer, cancellationToken);
        var payrolls = await payrollService.FindByPeriodAsync(period, cancellationToken);

        var payrollByEmployee = payrolls.ToDictionary(p => p.EmployeeId, p => p);
        var emails = employees.Select(e => e.Email).Where(e => !string.IsNullOrWhiteSpace(e)).Cast<string>().ToList();
        var accounts = await accountService.FindByEmailsAsync(emails, cancellationToken);
        var accountsByEmail = accounts
            .Where(a => !string.IsNullOrWhiteSpace(a.Email))
            .ToDictionary(a => a.Email!.ToLowerInvariant(), a => a);

        var rows = employees.Select(emp =>
        {
            payrollByEmployee.TryGetValue(emp.Id, out var payroll);
            var baseSalary = payroll?.BaseSalary ?? emp.Salary ?? 0m;
            var bonuses = payroll?.Bonuses ?? 0m;
            var deductions = payroll?.Deductions ?? 0m;
            var net = baseSalary + bonuses - deductions;

            var accountMasked = default(string?);
            var cardType = default(string?);
            if (!string.IsNullOrWhiteSpace(emp.Email) && accountsByEmail.TryGetValue(emp.Email.ToLowerInvariant(), out var account))
            {
                if (!string.IsNullOrWhiteSpace(account.AccountNumber) && account.AccountNumber!.Length >= 4)
                {
                    accountMasked = $"**** **** **** {account.AccountNumber[^4..]}";
                }
                cardType = account.CardType.ToString();
            }

            return new PayrollOverviewRow
            {
                EmployeeId = emp.Id,
                Name = $"{emp.FirstName} {emp.LastName}".Trim(),
                Base = baseSalary,
                Bonuses = bonuses,
                Deductions = deductions,
                Net = net,
                Paid = payroll != null,
                AccountMasked = accountMasked,
                CardType = cardType
            };
        }).ToList();

        return Ok(rows);
    }

    private async Task<long?> ResolveSelfEmployeeIdAsync(CancellationToken cancellationToken)
    {
        var bearer = Request.Headers["Authorization"].FirstOrDefault();
        var subject = User?.Identity?.Name;
        var usernameClaim = User?.Claims.FirstOrDefault(c => c.Type == "preferred_username" || c.Type == ClaimTypes.Email)?.Value;
        return await hrClient.ResolveEmployeeIdAsync(bearer, subject, usernameClaim, cancellationToken);
    }

    private static PayrollResponse ToResponse(Payroll payroll) => new()
    {
        Id = payroll.Id,
        EmployeeId = payroll.EmployeeId,
        Period = payroll.Period,
        BaseSalary = payroll.BaseSalary,
        Bonuses = payroll.Bonuses,
        Deductions = payroll.Deductions,
        NetSalary = payroll.NetSalary,
        ProcessedDate = payroll.ProcessedDate
    };
}
