namespace FinanceService.Services.Abstractions;

public interface IEventPublisher
{
    Task PublishAsync(string routingKey, object message, CancellationToken cancellationToken = default);
}
