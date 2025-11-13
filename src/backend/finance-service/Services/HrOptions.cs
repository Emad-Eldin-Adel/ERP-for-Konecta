namespace FinanceService.Services;

public class HrOptions
{
    public string? PrimaryBaseUrl { get; set; } = "http://api-gateway:8080/api/hr";
    public string? FallbackBaseUrl { get; set; } = "http://localhost:8080/api/hr";
}
