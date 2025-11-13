using System.Text.Json;
using FinanceService.Messaging;
using FinanceService.Services.Abstractions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;

namespace FinanceService.Messaging;

public class RabbitMqEventPublisher : IEventPublisher
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    private readonly IConnection _connection;
    private readonly EventBusOptions _options;
    private readonly ILogger<RabbitMqEventPublisher> _logger;

    public RabbitMqEventPublisher(IConnection connection, IOptions<EventBusOptions> options, ILogger<RabbitMqEventPublisher> logger)
    {
        _connection = connection;
        _options = options.Value;
        _logger = logger;
    }

    public Task PublishAsync(string routingKey, object message, CancellationToken cancellationToken = default)
    {
        using var channel = _connection.CreateModel();
        var payload = JsonSerializer.SerializeToUtf8Bytes(new EventEnvelope
        {
            Type = routingKey,
            EmittedAt = DateTime.UtcNow,
            Payload = message
        }, JsonOptions);

        var props = channel.CreateBasicProperties();
        props.ContentType = "application/json";
        props.DeliveryMode = 2; // persistent

        channel.BasicPublish(exchange: _options.EventsExchange,
            routingKey: routingKey,
            basicProperties: props,
            body: payload);

        _logger.LogInformation("Published event {RoutingKey}", routingKey);
        return Task.CompletedTask;
    }

    private sealed class EventEnvelope
    {
        public string? Type { get; set; }
        public DateTime EmittedAt { get; set; }
        public object? Payload { get; set; }
    }
}
