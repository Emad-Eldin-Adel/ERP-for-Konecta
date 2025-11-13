namespace FinanceService.Services;

public class JwtOptions
{
    public string Secret { get; set; } = string.Empty;
    public string? Issuer { get; set; }
    public string? Audience { get; set; }
    public int ExpirationMinutes { get; set; } = 1440;
}
