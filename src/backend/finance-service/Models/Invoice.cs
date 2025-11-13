using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinanceService.Models;

[Table("invoices")]
public class Invoice
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [MaxLength(255)]
    [Column("client_name")]
    public string? ClientName { get; set; }

    [Column("invoice_date")]
    public DateOnly? InvoiceDate { get; set; }

    [Column("amount")]
    public decimal? Amount { get; set; }

    [Column("status")]
    public InvoiceStatus Status { get; set; } = InvoiceStatus.DRAFT;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<InvoiceItem> Items { get; set; } = new();

    [Column("untaxed_total")]
    public decimal? UntaxedTotal { get; set; }

    [Column("tax_total")]
    public decimal? TaxTotal { get; set; }

    [Column("withholding_total")]
    public decimal? WithholdingTotal { get; set; }

    [Column("grand_total")]
    public decimal? GrandTotal { get; set; }

    [Column("pdf_file_name")]
    public string? PdfFileName { get; set; }

    [Column("pdf_content_type")]
    public string? PdfContentType { get; set; }

    [Column("pdf_data")]
    public byte[]? PdfData { get; set; }
}
