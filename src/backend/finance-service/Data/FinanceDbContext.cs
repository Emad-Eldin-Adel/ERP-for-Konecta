using FinanceService.Models;
using Microsoft.EntityFrameworkCore;

namespace FinanceService.Data;

public class FinanceDbContext(DbContextOptions<FinanceDbContext> options) : DbContext(options)
{
    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoiceItem> InvoiceItems => Set<InvoiceItem>();
    public DbSet<Payroll> Payroll => Set<Payroll>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Account>()
            .HasIndex(a => a.Email)
            .HasDatabaseName("idx_accounts_email");

        modelBuilder.Entity<Account>()
            .HasIndex(a => a.Username)
            .HasDatabaseName("idx_accounts_username");

        modelBuilder.Entity<Expense>()
            .HasIndex(e => new { e.Department, e.Category, e.ExpenseDate })
            .IsUnique();

        modelBuilder.Entity<Invoice>()
            .HasMany(i => i.Items)
            .WithOne(it => it.Invoice!)
            .HasForeignKey(it => it.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Payroll>()
            .HasIndex(p => new { p.EmployeeId, p.Period })
            .IsUnique();
    }

    public override int SaveChanges()
    {
        ApplyAuditInfo();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        ApplyAuditInfo();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void ApplyAuditInfo()
    {
        var now = DateTime.UtcNow;
        foreach (var entry in ChangeTracker.Entries<Account>())
        {
            if (entry.State == EntityState.Added)
            {
                if (entry.Entity.CreatedAt == default)
                {
                    entry.Entity.CreatedAt = now;
                }
                entry.Entity.Active = true;
            }
            if (entry.State == EntityState.Added || entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = now;
            }
        }

        foreach (var entry in ChangeTracker.Entries<Expense>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = now;
            }
        }

        foreach (var entry in ChangeTracker.Entries<Invoice>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = now;
            }
        }

        foreach (var entry in ChangeTracker.Entries<Payroll>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.ProcessedDate ??= DateOnly.FromDateTime(now);
            }
        }
    }
}
