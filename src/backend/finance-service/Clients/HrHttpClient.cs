using System.Net.Http.Headers;
using System.Text.Json;
using FinanceService.Services;
using FinanceService.Services.Abstractions;
using FinanceService.Services.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace FinanceService.Clients;

public class HrHttpClient : IHrClient
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly HrOptions _options;
    private readonly ILogger<HrHttpClient> _logger;
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public HrHttpClient(IHttpClientFactory httpClientFactory, IOptions<HrOptions> options, ILogger<HrHttpClient> logger)
    {
        _httpClientFactory = httpClientFactory;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<decimal?> GetBaseSalaryAsync(long employeeId, CancellationToken cancellationToken)
    {
        var client = _httpClientFactory.CreateClient(nameof(HrHttpClient));
        foreach (var url in EnumerateBaseUrls($"/employees/{employeeId}"))
        {
            try
            {
                using var response = await client.GetAsync(url, cancellationToken);
                if (!response.IsSuccessStatusCode) continue;
                await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
                var employee = await JsonSerializer.DeserializeAsync<JsonElement>(stream, JsonOptions, cancellationToken);
                if (employee.TryGetProperty("salary", out var salaryProp))
                {
                    if (salaryProp.TryGetDecimal(out var dec)) return dec;
                    if (decimal.TryParse(salaryProp.ToString(), out dec)) return dec;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to fetch salary for employee {EmployeeId} from {Url}", employeeId, url);
            }
        }

        return null;
    }

    public async Task<long?> ResolveEmployeeIdAsync(string? bearerToken, string? subject, string? usernameClaim, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(subject) && string.IsNullOrWhiteSpace(usernameClaim))
        {
            return null;
        }

        var employees = await GetEmployeesAsync(bearerToken, cancellationToken);
        foreach (var employee in employees)
        {
            if (string.IsNullOrWhiteSpace(employee.Email)) continue;
            if (string.Equals(employee.Email, subject, StringComparison.OrdinalIgnoreCase) ||
                (!string.IsNullOrWhiteSpace(usernameClaim) && string.Equals(employee.Email, usernameClaim, StringComparison.OrdinalIgnoreCase)))
            {
                return employee.Id;
            }
        }

        return null;
    }

    public async Task<string?> GetEmployeeEmailAsync(long employeeId, CancellationToken cancellationToken)
    {
        var client = _httpClientFactory.CreateClient(nameof(HrHttpClient));
        foreach (var url in EnumerateBaseUrls($"/employees/{employeeId}"))
        {
            try
            {
                using var response = await client.GetAsync(url, cancellationToken);
                if (!response.IsSuccessStatusCode) continue;
                await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
                var employee = await JsonSerializer.DeserializeAsync<JsonElement>(stream, JsonOptions, cancellationToken);
                if (employee.TryGetProperty("email", out var emailProp))
                {
                    return emailProp.GetString();
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to fetch email for employee {EmployeeId} from {Url}", employeeId, url);
            }
        }

        return null;
    }

    public async Task<IReadOnlyList<HrEmployee>> GetEmployeesAsync(string? bearerToken, CancellationToken cancellationToken)
    {
        var list = new List<HrEmployee>();
        var client = _httpClientFactory.CreateClient(nameof(HrHttpClient));
        if (!string.IsNullOrWhiteSpace(bearerToken))
        {
            client.DefaultRequestHeaders.Authorization = AuthenticationHeaderValue.Parse(
                bearerToken.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase) ? bearerToken : $"Bearer {bearerToken}");
        }
        else
        {
            client.DefaultRequestHeaders.Authorization = null;
        }

        foreach (var url in EnumerateBaseUrls("/employees"))
        {
            try
            {
                using var response = await client.GetAsync(url, cancellationToken);
                if (!response.IsSuccessStatusCode) continue;
                await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
                var employees = await JsonSerializer.DeserializeAsync<List<HrEmployee>>(stream, JsonOptions, cancellationToken);
                if (employees != null)
                {
                    list = employees;
                    break;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to fetch employees from {Url}", url);
            }
        }

        return list;
    }

    private IEnumerable<string> EnumerateBaseUrls(string pathSuffix)
    {
        if (!string.IsNullOrWhiteSpace(_options.PrimaryBaseUrl))
        {
            yield return $"{_options.PrimaryBaseUrl.TrimEnd('/')}{pathSuffix}";
        }
        if (!string.IsNullOrWhiteSpace(_options.FallbackBaseUrl) &&
            !string.Equals(_options.PrimaryBaseUrl, _options.FallbackBaseUrl, StringComparison.OrdinalIgnoreCase))
        {
            yield return $"{_options.FallbackBaseUrl.TrimEnd('/')}{pathSuffix}";
        }
    }
}
