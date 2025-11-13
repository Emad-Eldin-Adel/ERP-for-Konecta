namespace FinanceService.Messaging;

public class EventBusOptions
{
    public string EventsExchange { get; set; } = "erp.events";
    public string DeadLetterExchange { get; set; } = "erp.dlq";
    public string FinanceQueue { get; set; } = "finance-service.events";
    public string FinanceDeadLetterQueue { get; set; } = "finance-service.events.dlq";
    public string FinanceRoutingKey { get; set; } = "finance.#";
    public string UserActivatedRoutingKey { get; set; } = "auth.user.activated";
}
