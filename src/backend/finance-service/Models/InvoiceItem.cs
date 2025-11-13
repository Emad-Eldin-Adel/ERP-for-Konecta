using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinanceService.Models;

[Table("invoice_items")]
public class InvoiceItem
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Column("invoice_id")]
    public long InvoiceId { get; set; }

    public Invoice? Invoice { get; set; }

    [MaxLength(255)]
    [Column("product")]
    public string? Product { get; set; }

    [MaxLength(255)]
    [Column("account")]
    public string? Account { get; set; }

    [Column("due_date")]
    public DateOnly? DueDate { get; set; }

    [Column("quantity")]
    public decimal? Quantity { get; set; }

    [Column("price")]
    public decimal? Price { get; set; }

    [Column("discount_percent")]
    public decimal? DiscountPercent { get; set; }

    [Column("tax_percent")]
    public decimal? TaxPercent { get; set; }

    [Column("wh_percent")]
    public decimal? WhPercent { get; set; }

    [Column("base_amount")]
    public decimal? BaseAmount { get; set; }

    [Column("tax_amount")]
    public decimal? TaxAmount { get; set; }

    [Column("withholding")]
    public decimal? Withholding { get; set; }

    [Column("line_total")]
    public decimal? LineTotal { get; set; }
}
