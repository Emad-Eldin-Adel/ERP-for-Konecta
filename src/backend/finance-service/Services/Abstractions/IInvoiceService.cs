using FinanceService.Models;

namespace FinanceService.Services.Abstractions;

public interface IInvoiceService
{
    Task<Invoice> CreateAsync(Invoice invoice, CancellationToken cancellationToken);
    Task<Invoice> SendAsync(long id, CancellationToken cancellationToken);
    Task<Invoice> MarkPaidAsync(long id, CancellationToken cancellationToken);
    Task<IReadOnlyList<Invoice>> ByStatusAsync(InvoiceStatus status, CancellationToken cancellationToken);
    Task<IReadOnlyList<Invoice>> ListAllAsync(CancellationToken cancellationToken);
    Task<Invoice> GetByIdAsync(long id, CancellationToken cancellationToken);
    Task<Invoice> UpdateAsync(long id, Invoice updated, CancellationToken cancellationToken);
    Task UpdatePdfAsync(long id, string filename, string contentType, byte[] data, CancellationToken cancellationToken);
}
