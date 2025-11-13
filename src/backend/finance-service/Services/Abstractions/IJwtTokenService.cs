using System.Security.Claims;

namespace FinanceService.Services.Abstractions;

public interface IJwtTokenService
{
    ClaimsPrincipal? Validate(string token);
    string? GetSubject(string token);
    long? GetUserId(string token);
}
