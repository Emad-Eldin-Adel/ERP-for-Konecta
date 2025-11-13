using FinanceService.Models;

namespace FinanceService.Dtos.Requests;

public class EnsureAccountRequest
{
    public long? UserId { get; set; }
    public string? Username { get; set; }
    public string? Email { get; set; }
    public string? AccountNumber { get; set; }
    public CardType? CardType { get; set; }
}
