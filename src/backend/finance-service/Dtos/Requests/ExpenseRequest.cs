namespace FinanceService.Dtos.Requests;

public class ExpenseRequest
{
    public long? SubmittedBy { get; set; }
    public string? Category { get; set; }
    public decimal Amount { get; set; }
    public string? Description { get; set; }
}
