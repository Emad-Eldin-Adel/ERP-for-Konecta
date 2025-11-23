using System.IdentityModel.Tokens.Jwt;
using System.Text;
using FinanceService.Clients;
using FinanceService.Data;
using FinanceService.Messaging;
using FinanceService.Services;
using FinanceService.Services.Abstractions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;

JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

var builder = WebApplication.CreateBuilder(args);

const string CorsPolicyName = "AllowAll";

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicyName, policy =>
    {
        policy
            .SetIsOriginAllowed(_ => true)
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

var connectionString = builder.Configuration.GetConnectionString("FinanceDb")
    ?? builder.Configuration["Database:ConnectionString"];
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException("Database connection string is missing. Set ConnectionStrings:FinanceDb.");
}

builder.Services.AddDbContext<FinanceDbContext>(options =>
{
    options.UseNpgsql(connectionString);
});

builder.Services.AddHttpContextAccessor();
builder.Services.AddHttpClient();

builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));
builder.Services.Configure<RabbitMqOptions>(builder.Configuration.GetSection("RabbitMq"));
builder.Services.Configure<EventBusOptions>(builder.Configuration.GetSection("RabbitMq:Events"));
builder.Services.Configure<HrOptions>(builder.Configuration.GetSection("Hr"));

var jwtSecret = builder.Configuration["Jwt:Secret"];
if (string.IsNullOrWhiteSpace(jwtSecret))
{
    throw new InvalidOperationException("JWT secret missing. Configure Jwt:Secret.");
}
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));

builder.Services
	.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
	.AddJwtBearer(options =>
	{
		options.MapInboundClaims = false;
		options.TokenValidationParameters = new TokenValidationParameters
		{
			ValidateAudience = false,
			ValidateIssuer = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = signingKey,
            NameClaimType = "sub",
            RoleClaimType = "role"
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddSingleton<IConnection>(sp =>
{
    var rabbitOptions = sp.GetRequiredService<IOptions<RabbitMqOptions>>().Value;
    var factory = new ConnectionFactory
    {
        HostName = rabbitOptions.HostName,
        Port = rabbitOptions.Port,
        UserName = rabbitOptions.UserName,
        Password = rabbitOptions.Password,
        VirtualHost = rabbitOptions.VirtualHost,
        DispatchConsumersAsync = true
    };
    if (rabbitOptions.UseSsl)
    {
        factory.Ssl = new SslOption { Enabled = true };
    }
    return factory.CreateConnection("finance-service");
});

builder.Services.AddHostedService<RabbitMqInitializerHostedService>();
builder.Services.AddHostedService<FinanceEventConsumer>();

builder.Services.AddSingleton<IEventPublisher, RabbitMqEventPublisher>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddScoped<IExpenseService, ExpenseService>();
builder.Services.AddScoped<IExpenseImportService, ExpenseImportService>();
builder.Services.AddScoped<IInvoiceService, InvoiceService>();
builder.Services.AddScoped<IPayrollService, PayrollService>();
builder.Services.AddScoped<IBudgetService, BudgetService>();
builder.Services.AddScoped<IHrClient, HrHttpClient>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<FinanceDbContext>();
    await dbContext.Database.MigrateAsync();
}

if (app.Environment.IsDevelopment())
{
	app.MapOpenApi();
	app.UseHttpsRedirection();
}

app.UseCors(CorsPolicyName);
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();


