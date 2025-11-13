namespace FinanceService.Dtos.Requests;

public class PayrollRequest
{
    public long EmployeeId { get; set; }
    public string Period { get; set; } = string.Empty;
    public decimal? Bonuses { get; set; }
    public decimal? Deductions { get; set; }
    public decimal? BaseSalary { get; set; }
}
