using System.Text.Json;
using System.Threading;
using FinanceService.Dtos.Requests;
using FinanceService.Messaging;
using FinanceService.Models;
using FinanceService.Services.Abstractions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace FinanceService.Messaging;

public class FinanceEventConsumer : BackgroundService
{
    private readonly IConnection _connection;
    private readonly EventBusOptions _options;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<FinanceEventConsumer> _logger;
    private IModel? _channel;
    private string? _consumerTag;

    public FinanceEventConsumer(
        IConnection connection,
        IOptions<EventBusOptions> options,
        IServiceScopeFactory scopeFactory,
        ILogger<FinanceEventConsumer> logger)
    {
        _connection = connection;
        _options = options.Value;
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _channel = _connection.CreateModel();
        var consumer = new AsyncEventingBasicConsumer(_channel);
        consumer.Received += HandleMessageAsync;
        _consumerTag = _channel.BasicConsume(queue: _options.FinanceQueue, autoAck: false, consumer: consumer);
        return Task.Delay(Timeout.Infinite, stoppingToken);
    }

    public override Task StopAsync(CancellationToken cancellationToken)
    {
        if (_channel != null && _consumerTag != null)
        {
            _channel.BasicCancel(_consumerTag);
            _channel.Close();
            _channel.Dispose();
        }
        return base.StopAsync(cancellationToken);
    }

    private async Task HandleMessageAsync(object sender, BasicDeliverEventArgs args)
    {
        try
        {
            var envelope = JsonSerializer.Deserialize<EventEnvelope>(args.Body.Span, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (envelope?.Type == _options.UserActivatedRoutingKey)
            {
                await HandleUserActivatedAsync(envelope.Payload);
            }

            _channel?.BasicAck(args.DeliveryTag, false);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to process event from RabbitMQ");
            _channel?.BasicNack(args.DeliveryTag, false, requeue: false);
        }
    }

    private async Task HandleUserActivatedAsync(JsonElement payload)
    {
        try
        {
            var request = new EnsureAccountRequest
            {
                UserId = payload.TryGetProperty("userId", out var userId) && userId.TryGetInt64(out var id) ? id : null,
                Username = payload.TryGetProperty("username", out var username) ? username.GetString() : null,
                Email = payload.TryGetProperty("email", out var email) ? email.GetString() : null,
                AccountNumber = payload.TryGetProperty("accountNumber", out var account) ? account.GetString() : null,
                CardType = payload.TryGetProperty("cardType", out var cardType) && Enum.TryParse<CardType>(cardType.GetString(), true, out var parsed)
                    ? parsed
                    : null
            };

            if (string.IsNullOrWhiteSpace(request.AccountNumber) || request.CardType == null)
            {
                _logger.LogInformation("User activated event missing banking details; skipping auto-account creation.");
                return;
            }

            using var scope = _scopeFactory.CreateScope();
            var accountService = scope.ServiceProvider.GetRequiredService<IAccountService>();
            await accountService.EnsureAsync(request, CancellationToken.None);
            _logger.LogInformation("Ensured finance account for user {UserId}", request.UserId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to handle user activated event.");
        }
    }

    private sealed class EventEnvelope
    {
        public string? Type { get; set; }
        public JsonElement Payload { get; set; }
    }
}
