using FinanceService.Dtos.Requests;
using FinanceService.Models;

namespace FinanceService.Services.Abstractions;

public interface IAccountService
{
    Task<Account> EnsureAsync(EnsureAccountRequest request, CancellationToken cancellationToken);
    Task<Account?> FindByEmailAsync(string email, CancellationToken cancellationToken);
    Task<Account?> FindByUsernameAsync(string username, CancellationToken cancellationToken);
    Task<Account?> FindByUserIdAsync(long userId, CancellationToken cancellationToken);
    Task<IReadOnlyList<Account>> FindByEmailsAsync(IEnumerable<string> emails, CancellationToken cancellationToken);
}
