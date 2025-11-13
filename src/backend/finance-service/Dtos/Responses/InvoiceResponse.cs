using FinanceService.Models;

namespace FinanceService.Dtos.Responses;

public class InvoiceResponse
{
    public long Id { get; set; }
    public string? ClientName { get; set; }
    public DateOnly? InvoiceDate { get; set; }
    public decimal? Amount { get; set; }
    public InvoiceStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<InvoiceItemResponse> Items { get; set; } = new();
    public decimal? UntaxedTotal { get; set; }
    public decimal? TaxTotal { get; set; }
    public decimal? WithholdingTotal { get; set; }
    public decimal? GrandTotal { get; set; }
    public bool PdfAttached { get; set; }
}
