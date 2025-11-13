using FinanceService.Dtos.Requests;
using FinanceService.Dtos.Responses;
using FinanceService.Models;
using FinanceService.Services.Abstractions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace FinanceService.Controllers;

[ApiController]
[Route("api/finance/invoices")]
public class InvoicesController(IInvoiceService invoiceService) : ControllerBase
{
    [HttpPost]
    [Authorize(Roles = "ADMIN,FINANCE")]
    public async Task<ActionResult<InvoiceResponse>> Create([FromBody, Required] InvoiceRequest request, CancellationToken cancellationToken)
    {
        var invoice = await invoiceService.CreateAsync(FromRequest(request), cancellationToken);
        return Ok(ToResponse(invoice));
    }

    [HttpPut("{id:long}/send")]
    [Authorize(Roles = "ADMIN,FINANCE")]
    public async Task<ActionResult<InvoiceResponse>> Send(long id, CancellationToken cancellationToken)
    {
        var invoice = await invoiceService.SendAsync(id, cancellationToken);
        return Ok(ToResponse(invoice));
    }

    [HttpPut("{id:long}/mark-paid")]
    [Authorize(Roles = "ADMIN,FINANCE")]
    public async Task<ActionResult<InvoiceResponse>> MarkPaid(long id, CancellationToken cancellationToken)
    {
        var invoice = await invoiceService.MarkPaidAsync(id, cancellationToken);
        return Ok(ToResponse(invoice));
    }

    [HttpGet]
    [Authorize(Roles = "ADMIN,FINANCE")]
    public async Task<ActionResult<IReadOnlyList<InvoiceResponse>>> List([FromQuery] InvoiceStatus? status, CancellationToken cancellationToken)
    {
        IReadOnlyList<Invoice> invoices = status == null
            ? await invoiceService.ListAllAsync(cancellationToken)
            : await invoiceService.ByStatusAsync(status.Value, cancellationToken);

        return Ok(invoices.Select(ToResponse).ToList());
    }

    [HttpGet("{id:long}")]
    [Authorize(Roles = "ADMIN,FINANCE")]
    public async Task<ActionResult<InvoiceResponse>> Get(long id, CancellationToken cancellationToken)
    {
        var invoice = await invoiceService.GetByIdAsync(id, cancellationToken);
        return Ok(ToResponse(invoice));
    }

    [HttpPut("{id:long}")]
    [Authorize(Roles = "ADMIN,FINANCE")]
    public async Task<ActionResult<InvoiceResponse>> Update(long id, [FromBody] InvoiceRequest request, CancellationToken cancellationToken)
    {
        var invoice = await invoiceService.UpdateAsync(id, FromRequest(request), cancellationToken);
        return Ok(ToResponse(invoice));
    }

    [HttpPost("{id:long}/pdf")]
    [Authorize(Roles = "ADMIN,FINANCE")]
    [RequestSizeLimit(40_000_000)]
    public async Task<IActionResult> UploadPdf(long id, [FromForm] IFormFile file, CancellationToken cancellationToken)
    {
        await using var stream = new MemoryStream();
        await file.CopyToAsync(stream, cancellationToken);
        await invoiceService.UpdatePdfAsync(id, file.FileName ?? "invoice.pdf", file.ContentType ?? "application/pdf", stream.ToArray(), cancellationToken);
        return Ok();
    }

    [HttpPost("{id:long}/pdf-bin")]
    [Authorize(Roles = "ADMIN,FINANCE")]
    [Consumes("application/octet-stream", "application/pdf")]
    public async Task<IActionResult> UploadPdfBinary(long id,
        [FromHeader(Name = "X-Filename")] string? filename,
        [FromBody] byte[] body,
        CancellationToken cancellationToken)
    {
        await invoiceService.UpdatePdfAsync(id, filename ?? "invoice.pdf", "application/pdf", body, cancellationToken);
        return Ok();
    }

    [HttpGet("{id:long}/pdf")]
    [Authorize(Roles = "ADMIN,FINANCE")]
    public async Task<IActionResult> DownloadPdf(long id, CancellationToken cancellationToken)
    {
        var invoice = await invoiceService.GetByIdAsync(id, cancellationToken);
        if (invoice.PdfData == null || invoice.PdfData.Length == 0)
        {
            return NotFound();
        }

        return File(invoice.PdfData, invoice.PdfContentType ?? "application/pdf", invoice.PdfFileName ?? $"invoice-{id}.pdf");
    }

    private static Invoice FromRequest(InvoiceRequest request)
    {
        var invoice = new Invoice
        {
            ClientName = request.ClientName,
            InvoiceDate = request.InvoiceDate,
            Amount = request.Amount,
            Items = new List<InvoiceItem>()
        };

        if (request.Items != null)
        {
            foreach (var item in request.Items)
            {
                invoice.Items.Add(new InvoiceItem
                {
                    Product = item.Product,
                    Account = item.Account,
                    DueDate = item.DueDate,
                    Quantity = item.Quantity,
                    Price = item.Price,
                    DiscountPercent = item.DiscountPercent,
                    TaxPercent = item.TaxPercent,
                    WhPercent = item.WhPercent
                });
            }
        }

        return invoice;
    }

    private static InvoiceResponse ToResponse(Invoice invoice) => new()
    {
        Id = invoice.Id,
        ClientName = invoice.ClientName,
        InvoiceDate = invoice.InvoiceDate,
        Amount = invoice.Amount,
        Status = invoice.Status,
        CreatedAt = invoice.CreatedAt,
        UntaxedTotal = invoice.UntaxedTotal,
        TaxTotal = invoice.TaxTotal,
        WithholdingTotal = invoice.WithholdingTotal,
        GrandTotal = invoice.GrandTotal,
        PdfAttached = invoice.PdfData != null && invoice.PdfData.Length > 0,
        Items = invoice.Items?.Select(it => new InvoiceItemResponse
        {
            Id = it.Id,
            Product = it.Product,
            Account = it.Account,
            DueDate = it.DueDate,
            Quantity = it.Quantity,
            Price = it.Price,
            DiscountPercent = it.DiscountPercent,
            TaxPercent = it.TaxPercent,
            WhPercent = it.WhPercent,
            BaseAmount = it.BaseAmount,
            TaxAmount = it.TaxAmount,
            Withholding = it.Withholding,
            LineTotal = it.LineTotal
        }).ToList() ?? new List<InvoiceItemResponse>()
    };
}
