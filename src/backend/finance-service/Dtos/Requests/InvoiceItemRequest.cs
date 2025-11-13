namespace FinanceService.Dtos.Requests;

public class InvoiceItemRequest
{
    public string? Product { get; set; }
    public string? Account { get; set; }
    public DateOnly? DueDate { get; set; }
    public decimal? Quantity { get; set; }
    public decimal? Price { get; set; }
    public decimal? DiscountPercent { get; set; }
    public decimal? TaxPercent { get; set; }
    public decimal? WhPercent { get; set; }
}
