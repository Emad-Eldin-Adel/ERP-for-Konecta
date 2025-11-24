using System.Globalization;
using ClosedXML.Excel;
using CsvHelper;
using CsvHelper.Configuration;
using FinanceService.Data;
using FinanceService.Dtos.Responses;
using FinanceService.Models;
using FinanceService.Services.Abstractions;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace FinanceService.Services;

public class ExpenseImportService(FinanceDbContext dbContext) : IExpenseImportService
{
    public async Task<ImportSummary> ImportAsync(IFormFile file, string dateFormat, ExpenseStatus status, string mode, long? importerId, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(file);

        var fileName = file.FileName?.ToLowerInvariant() ?? string.Empty;
        await using var stream = file.OpenReadStream();
        if (fileName.EndsWith(".xlsx") || fileName.EndsWith(".xls"))
        {
            return await ImportFromExcelAsync(stream, file.FileName, dateFormat, status, mode, importerId, cancellationToken);
        }

        if (fileName.EndsWith(".csv"))
        {
            return await ImportFromCsvAsync(stream, file.FileName, dateFormat, status, mode, importerId, cancellationToken);
        }

        throw new InvalidOperationException($"Unsupported file type: {file.FileName}");
    }

    public async Task<ImportSummary> ImportAsync(byte[] body, string? filename, string dateFormat, ExpenseStatus status, string mode, long? importerId, CancellationToken cancellationToken)
    {
        var name = filename?.ToLowerInvariant() ?? string.Empty;
        await using var stream = new MemoryStream(body);
        if (name.EndsWith(".xlsx") || name.EndsWith(".xls"))
        {
            return await ImportFromExcelAsync(stream, filename, dateFormat, status, mode, importerId, cancellationToken);
        }

        stream.Position = 0;
        return await ImportFromCsvAsync(stream, filename, dateFormat, status, mode, importerId, cancellationToken);
    }

    private async Task<ImportSummary> ImportFromExcelAsync(Stream stream, string? filename, string dateFormat, ExpenseStatus status, string mode, long? importerId, CancellationToken cancellationToken)
    {
        var summary = new ImportSummary();
        using var workbook = new XLWorkbook(stream);
        var sheet = workbook.Worksheets.FirstOrDefault();
        if (sheet == null) return summary;

        var headerRow = sheet.FirstRowUsed();
        if (headerRow == null) return summary;

        var headers = headerRow.Cells().ToDictionary(c => c.GetString().Trim().ToLowerInvariant(), c => c.Address.ColumnNumber);
        var monthCol = Require(headers, ["month", "date", "expense date", "expense_date"]);
        var deptCol = Require(headers, ["department"]);
        var categoryCol = Require(headers, ["expense type", "category", "type"]);
        var amountCol = Require(headers, ["amount", "value"]);

        var formatter = new CultureInfo("en-US");
        var format = DateTime.TryParseExact(dateFormat, "M/d/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out _)
            ? dateFormat
            : "M/d/yyyy";
        var dtFormat = format;

        foreach (var row in sheet.RowsUsed().Skip(1))
        {
            try
            {
                var month = row.Cell(monthCol)?.GetValue<string>()?.Trim() ?? string.Empty;
                var dept = row.Cell(deptCol)?.GetValue<string>()?.Trim() ?? string.Empty;
                var category = row.Cell(categoryCol)?.GetValue<string>()?.Trim() ?? string.Empty;
                var amountText = row.Cell(amountCol)?.GetValue<string>()?.Trim() ?? "0";
                if (string.IsNullOrWhiteSpace(month) || string.IsNullOrWhiteSpace(dept) || string.IsNullOrWhiteSpace(category))
                {
                    continue;
                }

                var date = ParseDate(month, dtFormat);
                var amount = ParseDecimal(amountText);
                await UpsertExpenseAsync(summary, dept, category, date, amount, status, mode, filename, importerId, cancellationToken);
            }
            catch (Exception ex)
            {
                summary.Errors.Add($"Row {row.RowNumber()}: {ex.Message}");
            }
        }

        return summary;
    }

    private async Task<ImportSummary> ImportFromCsvAsync(Stream stream, string? filename, string dateFormat, ExpenseStatus status, string mode, long? importerId, CancellationToken cancellationToken)
    {
        var summary = new ImportSummary();
        using var reader = new StreamReader(stream);
        var config = new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            TrimOptions = TrimOptions.Trim,
            IgnoreBlankLines = true,
            BadDataFound = null
        };
        using var csv = new CsvReader(reader, config);
        var csvReader = csv ?? throw new InvalidOperationException("Unable to initialize CSV reader.");
        await csvReader.ReadAsync();
        csvReader.ReadHeader();
        var header = csvReader.HeaderRecord?.Select(h => h.Trim().ToLowerInvariant()).ToArray() ?? Array.Empty<string>();
        var monthIndex = Require(header, ["month", "date", "expense date", "expense_date"]);
        var deptIndex = Require(header, ["department"]);
        var categoryIndex = Require(header, ["expense type", "category", "type"]);
        var amountIndex = Require(header, ["amount", "value"]);

#pragma warning disable CS8602
        while (await csvReader.ReadAsync())
#pragma warning restore CS8602
        {
            try
            {
                var month = csvReader.GetField(monthIndex) ?? string.Empty;
                var dept = csvReader.GetField(deptIndex) ?? string.Empty;
                var category = csvReader.GetField(categoryIndex) ?? string.Empty;
                var amountText = csvReader.GetField(amountIndex) ?? "0";

                if (string.IsNullOrWhiteSpace(month) || string.IsNullOrWhiteSpace(dept) || string.IsNullOrWhiteSpace(category))
                {
                    continue;
                }

                var date = ParseDate(month, dateFormat);
                var amount = ParseDecimal(amountText);
                await UpsertExpenseAsync(summary, dept, category, date, amount, status, mode, filename, importerId, cancellationToken);
            }
            catch (Exception ex)
            {
                var rowNumber = csvReader?.Context?.Parser?.Row ?? -1;
                summary.Errors.Add($"Row {rowNumber}: {ex.Message}");
            }
        }

        return summary;
    }

    private async Task UpsertExpenseAsync(ImportSummary summary, string department, string category, DateOnly date, decimal amount, ExpenseStatus status, string mode, string? fileName, long? importerId, CancellationToken cancellationToken)
    {
        var extRef = $"{department}|{category}|{date:yyyy-MM}";
        var existing = await dbContext.Expenses.FirstOrDefaultAsync(e => e.ExternalRef == extRef, cancellationToken)
                        ?? await dbContext.Expenses.FirstOrDefaultAsync(e =>
                            e.Department == department && e.Category == category && e.ExpenseDate == date, cancellationToken);

        if (existing == null)
        {
            var expense = new Expense
            {
                Department = department,
                Category = category,
                ExpenseDate = date,
                Amount = amount,
                Status = status,
                CreatedAt = DateTime.UtcNow,
                Description = $"Imported {fileName ?? string.Empty}".Trim(),
                Source = ExpenseSource.IMPORT,
                ExternalRef = extRef,
                SubmittedBy = importerId
            };
            dbContext.Expenses.Add(expense);
            summary.Inserted++;
        }
        else
        {
            if (string.Equals(mode, "upsert", StringComparison.OrdinalIgnoreCase))
            {
                existing.Amount = amount;
                existing.Status = status;
                existing.Source = ExpenseSource.IMPORT;
                existing.ExternalRef = extRef;
                if (existing.SubmittedBy == null && importerId != null)
                {
                    existing.SubmittedBy = importerId;
                }
                summary.Updated++;
            }
            else
            {
                summary.Skipped++;
                return;
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static DateOnly ParseDate(string value, string dateFormat)
    {
        if (DateOnly.TryParseExact(value, dateFormat, CultureInfo.InvariantCulture, DateTimeStyles.None, out var date))
        {
            return date;
        }
        if (DateTime.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.None, out var dt))
        {
            return DateOnly.FromDateTime(dt);
        }
        throw new FormatException($"Invalid date '{value}'.");
    }

    private static decimal ParseDecimal(string? value)
    {
        var trimmed = value?.Trim() ?? string.Empty;
        if (string.IsNullOrEmpty(trimmed)) return 0;

        trimmed = trimmed.Replace(",", "");
        if (decimal.TryParse(trimmed, NumberStyles.Any, CultureInfo.InvariantCulture, out var result))
        {
            return result;
        }
        throw new FormatException($"Invalid amount '{value}'.");
    }

    private static int Require(IReadOnlyDictionary<string, int> header, params string[] candidates)
    {
        foreach (var candidate in candidates)
        {
            if (header.TryGetValue(candidate, out var index))
            {
                return index;
            }
        }

        throw new InvalidOperationException($"Missing required column: {string.Join('/', candidates)}");
    }

    private static int Require(IReadOnlyList<string> header, params string[] candidates)
    {
        for (var i = 0; i < header.Count; i++)
        {
            if (candidates.Contains(header[i], StringComparer.OrdinalIgnoreCase))
            {
                return i;
            }
        }

        throw new InvalidOperationException($"Missing required column: {string.Join('/', candidates)}");
    }
}
