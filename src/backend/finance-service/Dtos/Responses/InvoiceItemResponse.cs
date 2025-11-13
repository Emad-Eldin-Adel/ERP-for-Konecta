using System.Text.Json.Serialization;

namespace FinanceService.Dtos.Responses;

public class InvoiceItemResponse
{
    public long Id { get; set; }
    public string? Product { get; set; }
    public string? Account { get; set; }
    public DateOnly? DueDate { get; set; }
    public decimal? Quantity { get; set; }
    public decimal? Price { get; set; }
    public decimal? DiscountPercent { get; set; }
    public decimal? TaxPercent { get; set; }
    public decimal? WhPercent { get; set; }
    public decimal? BaseAmount { get; set; }
    public decimal? TaxAmount { get; set; }
    public decimal? Withholding { get; set; }
    public decimal? LineTotal { get; set; }
}
