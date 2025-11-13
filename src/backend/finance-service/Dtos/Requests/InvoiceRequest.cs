namespace FinanceService.Dtos.Requests;

public class InvoiceRequest
{
    public string? ClientName { get; set; }
    public DateOnly? InvoiceDate { get; set; }
    public decimal? Amount { get; set; }
    public List<InvoiceItemRequest>? Items { get; set; }
}
