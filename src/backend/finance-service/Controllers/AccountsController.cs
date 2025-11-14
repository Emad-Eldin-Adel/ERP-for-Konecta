using FinanceService.Dtos.Requests;
using FinanceService.Dtos.Responses;
using FinanceService.Services.Abstractions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace FinanceService.Controllers;

[ApiController]
[Route("api/finance/accounts")]
public class AccountsController(IAccountService accountService, IJwtTokenService jwtTokenService) : ControllerBase
{
    [HttpPost("ensure")]
    [AllowAnonymous]
    public async Task<ActionResult<AccountResponse>> Ensure([FromBody] EnsureAccountRequest request, CancellationToken cancellationToken)
    {
        var account = await accountService.EnsureAsync(request, cancellationToken);
        return Ok(ToResponse(account));
    }

    [HttpGet("by-email")]
    [Authorize(Roles = "ADMIN,FINANCE,HR")]
    public async Task<ActionResult<AccountResponse>> ByEmail([FromQuery] string email, CancellationToken cancellationToken)
    {
        var account = await accountService.FindByEmailAsync(email, cancellationToken);
        return account == null ? NotFound() : Ok(ToResponse(account));
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<AccountResponse>> Me(CancellationToken cancellationToken)
    {
        var subject = GetSubject();
        if (string.IsNullOrWhiteSpace(subject))
        {
            return Forbid();
        }

        var account = await accountService.FindByEmailAsync(subject, cancellationToken)
                      ?? await accountService.FindByUsernameAsync(subject, cancellationToken);

        return account == null ? NotFound() : Ok(ToResponse(account));
    }

    [HttpPost("by-emails")]
    [Authorize(Roles = "ADMIN,FINANCE,HR")]
    public async Task<ActionResult<IReadOnlyList<AccountResponse>>> ByEmails([FromBody] List<string> emails, CancellationToken cancellationToken)
    {
        var accounts = await accountService.FindByEmailsAsync(emails, cancellationToken);
        return Ok(accounts.Select(ToResponse).ToList());
    }

    [HttpPost("by-usernames")]
    [Authorize(Roles = "ADMIN,FINANCE,HR")]
    public async Task<ActionResult<IReadOnlyList<AccountResponse>>> ByUsernames([FromBody] List<string> usernames, CancellationToken cancellationToken)
    {
        var accounts = await accountService.FindByUsernamesAsync(usernames, cancellationToken);
        return Ok(accounts.Select(ToResponse).ToList());
    }

    private string? GetSubject()
    {
        var subject = User?.Identity?.Name;
        if (!string.IsNullOrWhiteSpace(subject)) return subject;

        var token = ExtractToken();
        return token == null ? null : jwtTokenService.GetSubject(token);
    }

    private string? ExtractToken()
    {
        if (!Request.Headers.TryGetValue("Authorization", out var header)) return null;
        var value = header.FirstOrDefault();
        if (string.IsNullOrWhiteSpace(value)) return null;
        return value.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase) ? value[7..] : value;
    }

    private static AccountResponse ToResponse(Models.Account account) => new()
    {
        Id = account.Id,
        UserId = account.UserId,
        Username = account.Username,
        Email = account.Email,
        AccountNumber = account.AccountNumber,
        CardType = account.CardType,
        Active = account.Active
    };
}
