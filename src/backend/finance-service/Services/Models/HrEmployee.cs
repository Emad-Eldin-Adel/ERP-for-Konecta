namespace FinanceService.Services.Models;

public class HrEmployee
{
    public long Id { get; set; }
    public string? Email { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public decimal? Salary { get; set; }
}
