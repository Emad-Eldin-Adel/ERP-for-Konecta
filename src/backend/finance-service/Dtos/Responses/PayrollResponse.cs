namespace FinanceService.Dtos.Responses;

public class PayrollResponse
{
    public long Id { get; set; }
    public long EmployeeId { get; set; }
    public string Period { get; set; } = string.Empty;
    public decimal? BaseSalary { get; set; }
    public decimal? Bonuses { get; set; }
    public decimal? Deductions { get; set; }
    public decimal? NetSalary { get; set; }
    public DateOnly? ProcessedDate { get; set; }
}
