using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinanceService.Models;

[Table("payroll")]
public class Payroll
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Column("employee_id")]
    public long EmployeeId { get; set; }

    [Required]
    [MaxLength(16)]
    [Column("period")]
    public string Period { get; set; } = string.Empty; // YYYY-MM

    [Column("base_salary")]
    public decimal? BaseSalary { get; set; }

    [Column("bonuses")]
    public decimal? Bonuses { get; set; }

    [Column("deductions")]
    public decimal? Deductions { get; set; }

    [Column("net_salary")]
    public decimal? NetSalary { get; set; }

    [Column("processed_date")]
    public DateOnly? ProcessedDate { get; set; }
}
