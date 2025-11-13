using FinanceService.Data;
using FinanceService.Models;
using FinanceService.Services.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace FinanceService.Services;

public class InvoiceService(FinanceDbContext dbContext) : IInvoiceService
{
    public async Task<Invoice> CreateAsync(Invoice invoice, CancellationToken cancellationToken)
    {
        invoice.Status = InvoiceStatus.DRAFT;
        invoice.CreatedAt = DateTime.UtcNow;
        RecalculateTotals(invoice);
        dbContext.Invoices.Add(invoice);
        await dbContext.SaveChangesAsync(cancellationToken);
        return invoice;
    }

    public async Task<Invoice> SendAsync(long id, CancellationToken cancellationToken)
    {
        var invoice = await GetTrackedAsync(id, cancellationToken);
        invoice.Status = InvoiceStatus.SENT;
        await dbContext.SaveChangesAsync(cancellationToken);
        return invoice;
    }

    public async Task<Invoice> MarkPaidAsync(long id, CancellationToken cancellationToken)
    {
        var invoice = await GetTrackedAsync(id, cancellationToken);
        invoice.Status = InvoiceStatus.PAID;
        await dbContext.SaveChangesAsync(cancellationToken);
        return invoice;
    }

    public async Task<IReadOnlyList<Invoice>> ByStatusAsync(InvoiceStatus status, CancellationToken cancellationToken) =>
        await dbContext.Invoices
            .Include(i => i.Items)
            .Where(i => i.Status == status)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Invoice>> ListAllAsync(CancellationToken cancellationToken) =>
        await dbContext.Invoices.Include(i => i.Items).ToListAsync(cancellationToken);

    public async Task<Invoice> GetByIdAsync(long id, CancellationToken cancellationToken) =>
        await dbContext.Invoices.Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.Id == id, cancellationToken)
        ?? throw new KeyNotFoundException($"Invoice {id} not found");

    public async Task<Invoice> UpdateAsync(long id, Invoice updated, CancellationToken cancellationToken)
    {
        var existing = await dbContext.Invoices
            .Include(i => i.Items)
            .FirstOrDefaultAsync(i => i.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException($"Invoice {id} not found");

        existing.ClientName = updated.ClientName;
        existing.InvoiceDate = updated.InvoiceDate;
        existing.Amount = updated.Amount;

        existing.Items.Clear();
        if (updated.Items != null)
        {
            foreach (var item in updated.Items)
            {
                item.InvoiceId = existing.Id;
                item.Invoice = existing;
                existing.Items.Add(item);
            }
        }

        RecalculateTotals(existing);
        await dbContext.SaveChangesAsync(cancellationToken);
        return existing;
    }

    public async Task UpdatePdfAsync(long id, string filename, string contentType, byte[] data, CancellationToken cancellationToken)
    {
        var existing = await GetTrackedAsync(id, cancellationToken);
        existing.PdfFileName = filename;
        existing.PdfContentType = string.IsNullOrWhiteSpace(contentType) ? "application/pdf" : contentType;
        existing.PdfData = data;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task<Invoice> GetTrackedAsync(long id, CancellationToken cancellationToken) =>
        await dbContext.Invoices
            .FirstOrDefaultAsync(i => i.Id == id, cancellationToken)
        ?? throw new KeyNotFoundException($"Invoice {id} not found");

    private static void RecalculateTotals(Invoice invoice)
    {
        decimal untaxed = 0;
        decimal tax = 0;
        decimal wh = 0;
        decimal total = 0;

        if (invoice.Items != null)
        {
            foreach (var item in invoice.Items)
            {
                var quantity = item.Quantity ?? 0;
                var price = item.Price ?? 0;
                var discount = item.DiscountPercent ?? 0;
                var taxPercent = item.TaxPercent ?? 0;
                var whPercent = item.WhPercent ?? 0;

                var baseAmount = quantity * price * (1 - discount / 100m);
                var taxAmount = baseAmount * (taxPercent / 100m);
                var withholding = taxAmount * (whPercent / 100m);
                var lineTotal = baseAmount + taxAmount - withholding;

                item.BaseAmount = Round(baseAmount);
                item.TaxAmount = Round(taxAmount);
                item.Withholding = Round(withholding);
                item.LineTotal = Round(lineTotal);

                untaxed += item.BaseAmount ?? 0;
                tax += item.TaxAmount ?? 0;
                wh += item.Withholding ?? 0;
                total += item.LineTotal ?? 0;
            }
        }

        invoice.UntaxedTotal = Round(untaxed);
        invoice.TaxTotal = Round(tax);
        invoice.WithholdingTotal = Round(wh);
        invoice.GrandTotal = Round(total);
        invoice.Amount = invoice.GrandTotal;
    }

    private static decimal Round(decimal value) => Math.Round(value, 2, MidpointRounding.AwayFromZero);
}
