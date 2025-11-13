using FinanceService.Models;

namespace FinanceService.Dtos.Responses;

public class AccountResponse
{
    public long Id { get; set; }
    public long? UserId { get; set; }
    public string? Username { get; set; }
    public string? Email { get; set; }
    public string? AccountNumber { get; set; }
    public CardType CardType { get; set; }
    public bool Active { get; set; }
}
