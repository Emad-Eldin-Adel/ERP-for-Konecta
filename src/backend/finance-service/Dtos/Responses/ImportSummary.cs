namespace FinanceService.Dtos.Responses;

public class ImportSummary
{
    public int Inserted { get; set; }
    public int Updated { get; set; }
    public int Skipped { get; set; }
    public List<string> Errors { get; set; } = new();
}
