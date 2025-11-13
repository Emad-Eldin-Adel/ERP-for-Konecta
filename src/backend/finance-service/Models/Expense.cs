using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinanceService.Models;

[Table("expenses")]
public class Expense
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Column("submitted_by")]
    public long? SubmittedBy { get; set; }

    [MaxLength(255)]
    [Column("category")]
    public string? Category { get; set; }

    [Column("amount")]
    public decimal Amount { get; set; }

    [Column("description")]
    public string? Description { get; set; }

    [Column("status")]
    public ExpenseStatus Status { get; set; }

    [Column("approved_by")]
    public long? ApprovedBy { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [MaxLength(255)]
    [Column("department")]
    public string? Department { get; set; }

    [Column("expense_date")]
    public DateOnly? ExpenseDate { get; set; }

    [Column("source")]
    public ExpenseSource Source { get; set; } = ExpenseSource.USER;

    [MaxLength(200)]
    [Column("external_ref")]
    public string? ExternalRef { get; set; }
}
