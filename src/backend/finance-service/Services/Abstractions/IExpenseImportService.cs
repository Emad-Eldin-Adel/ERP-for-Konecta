using FinanceService.Dtos.Responses;
using FinanceService.Models;
using Microsoft.AspNetCore.Http;

namespace FinanceService.Services.Abstractions;

public interface IExpenseImportService
{
    Task<ImportSummary> ImportAsync(IFormFile file, string dateFormat, ExpenseStatus status, string mode, long? importerId, CancellationToken cancellationToken);
    Task<ImportSummary> ImportAsync(byte[] body, string? filename, string dateFormat, ExpenseStatus status, string mode, long? importerId, CancellationToken cancellationToken);
}
