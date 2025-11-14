using FinanceService.Data;
using FinanceService.Dtos.Requests;
using FinanceService.Models;
using FinanceService.Services.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace FinanceService.Services;

public class AccountService(FinanceDbContext dbContext) : IAccountService
{
    public async Task<Account> EnsureAsync(EnsureAccountRequest request, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        if (string.IsNullOrWhiteSpace(request.AccountNumber) || request.CardType is null)
        {
            throw new ArgumentException("Account number and card type are required.");
        }

        IQueryable<Account> query = dbContext.Accounts.AsQueryable();
        Account? account = null;

        if (request.UserId is { } userId)
        {
            account = await query.FirstOrDefaultAsync(a => a.UserId == userId, cancellationToken);
        }
        if (account == null && !string.IsNullOrWhiteSpace(request.Email))
        {
            account = await query.FirstOrDefaultAsync(a => a.Email!.ToLower() == request.Email.ToLower(), cancellationToken);
        }
        if (account == null && !string.IsNullOrWhiteSpace(request.Username))
        {
            account = await query.FirstOrDefaultAsync(a => a.Username!.ToLower() == request.Username.ToLower(), cancellationToken);
        }

        if (account == null)
        {
            account = new Account();
            dbContext.Accounts.Add(account);
        }

        account.UserId = request.UserId;
        if (!string.IsNullOrWhiteSpace(request.Username))
        {
            account.Username = request.Username;
        }
        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            account.Email = request.Email;
        }
        account.AccountNumber = request.AccountNumber;
        account.CardType = request.CardType.Value;
        account.Active = true;

        await dbContext.SaveChangesAsync(cancellationToken);
        return account;
    }

    public Task<Account?> FindByEmailAsync(string email, CancellationToken cancellationToken) =>
        dbContext.Accounts.FirstOrDefaultAsync(a => a.Email != null && a.Email.ToLower() == email.ToLower(), cancellationToken);

    public Task<Account?> FindByUsernameAsync(string username, CancellationToken cancellationToken) =>
        dbContext.Accounts.FirstOrDefaultAsync(a => a.Username != null && a.Username.ToLower() == username.ToLower(), cancellationToken);

    public Task<Account?> FindByUserIdAsync(long userId, CancellationToken cancellationToken) =>
        dbContext.Accounts.FirstOrDefaultAsync(a => a.UserId == userId, cancellationToken);

    public async Task<IReadOnlyList<Account>> FindByEmailsAsync(IEnumerable<string> emails, CancellationToken cancellationToken)
    {
        var lower = emails.Where(e => !string.IsNullOrWhiteSpace(e))
            .Select(e => e.ToLower())
            .Distinct()
            .ToArray();

        if (lower.Length == 0) return Array.Empty<Account>();

        return await dbContext.Accounts
            .Where(a => a.Email != null && lower.Contains(a.Email.ToLower()))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Account>> FindByUsernamesAsync(IEnumerable<string> usernames, CancellationToken cancellationToken)
    {
        var lower = usernames.Where(u => !string.IsNullOrWhiteSpace(u))
            .Select(u => u.ToLower())
            .Distinct()
            .ToArray();

        if (lower.Length == 0) return Array.Empty<Account>();

        return await dbContext.Accounts
            .Where(a => a.Username != null && lower.Contains(a.Username.ToLower()))
            .ToListAsync(cancellationToken);
    }
}
