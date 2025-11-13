using FinanceService.Models;

namespace FinanceService.Dtos.Responses;

public class ExpenseResponse
{
    public long Id { get; set; }
    public long? SubmittedBy { get; set; }
    public string? Category { get; set; }
    public decimal Amount { get; set; }
    public string? Description { get; set; }
    public ExpenseStatus Status { get; set; }
    public long? ApprovedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? Department { get; set; }
    public DateOnly? ExpenseDate { get; set; }
}
