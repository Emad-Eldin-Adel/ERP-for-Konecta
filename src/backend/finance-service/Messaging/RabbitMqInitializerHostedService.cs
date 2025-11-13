using System.Collections.Generic;
using FinanceService.Messaging;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;

namespace FinanceService.Messaging;

public class RabbitMqInitializerHostedService : IHostedService
{
    private readonly IConnection _connection;
    private readonly EventBusOptions _eventOptions;
    private readonly ILogger<RabbitMqInitializerHostedService> _logger;

    public RabbitMqInitializerHostedService(
        IConnection connection,
        IOptions<EventBusOptions> eventOptions,
        ILogger<RabbitMqInitializerHostedService> logger)
    {
        _connection = connection;
        _eventOptions = eventOptions.Value;
        _logger = logger;
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        using var channel = _connection.CreateModel();

        channel.ExchangeDeclare(_eventOptions.EventsExchange, ExchangeType.Topic, durable: true, autoDelete: false);
        channel.ExchangeDeclare(_eventOptions.DeadLetterExchange, ExchangeType.Topic, durable: true, autoDelete: false);

        channel.QueueDeclare(_eventOptions.FinanceQueue,
            durable: true,
            exclusive: false,
            autoDelete: false,
            arguments: new Dictionary<string, object>
            {
                { "x-dead-letter-exchange", _eventOptions.DeadLetterExchange },
                { "x-dead-letter-routing-key", _eventOptions.FinanceQueue }
            });

        channel.QueueDeclare(_eventOptions.FinanceDeadLetterQueue,
            durable: true,
            exclusive: false,
            autoDelete: false);

        channel.QueueBind(_eventOptions.FinanceQueue, _eventOptions.EventsExchange, _eventOptions.UserActivatedRoutingKey);
        channel.QueueBind(_eventOptions.FinanceDeadLetterQueue, _eventOptions.DeadLetterExchange, _eventOptions.FinanceQueue);

        _logger.LogInformation("RabbitMQ exchanges/queues declared.");
        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
