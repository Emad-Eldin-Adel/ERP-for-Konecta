namespace FinanceService.Dtos.Responses;

public class PayrollOverviewRow
{
    public long EmployeeId { get; set; }
    public string? Name { get; set; }
    public decimal Base { get; set; }
    public decimal Bonuses { get; set; }
    public decimal Deductions { get; set; }
    public decimal Net { get; set; }
    public bool Paid { get; set; }
    public string? AccountMasked { get; set; }
    public string? CardType { get; set; }
}
