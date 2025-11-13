using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FinanceService.Services.Abstractions;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Options;

namespace FinanceService.Services;

public class JwtTokenService : IJwtTokenService
{
    private readonly JwtSecurityTokenHandler _tokenHandler = new();
    private readonly TokenValidationParameters _validationParameters;

    public JwtTokenService(IOptions<JwtOptions> options)
    {
        var jwt = options.Value;
        if (string.IsNullOrWhiteSpace(jwt.Secret))
        {
            throw new InvalidOperationException("JWT secret is not configured.");
        }

        _validationParameters = new TokenValidationParameters
        {
            ValidateIssuer = !string.IsNullOrWhiteSpace(jwt.Issuer),
            ValidIssuer = jwt.Issuer,
            ValidateAudience = !string.IsNullOrWhiteSpace(jwt.Audience),
            ValidAudience = jwt.Audience,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Secret)),
            NameClaimType = "sub",
            RoleClaimType = "role"
        };
    }

    public ClaimsPrincipal? Validate(string token)
    {
        try
        {
            return _tokenHandler.ValidateToken(token, _validationParameters, out _);
        }
        catch
        {
            return null;
        }
    }

    public string? GetSubject(string token) => Validate(token)?.FindFirstValue(_validationParameters.NameClaimType);

    public long? GetUserId(string token)
    {
        var principal = Validate(token);
        var uidClaim = principal?.FindFirst("uid");
        if (uidClaim == null && principal != null)
        {
            uidClaim = principal.FindFirst(ClaimTypes.NameIdentifier);
        }

        if (uidClaim == null) return null;

        return long.TryParse(uidClaim.Value, out var id) ? id : null;
    }
}
