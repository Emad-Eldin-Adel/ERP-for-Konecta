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
    public DbSet<BudgetCycle> BudgetCycles => Set<BudgetCycle>();
    public DbSet<BudgetStageStatus> BudgetStageStatuses => Set<BudgetStageStatus>();
    public DbSet<BudgetSnapshot> BudgetSnapshots => Set<BudgetSnapshot>();

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

        modelBuilder.Entity<BudgetCycle>()
            .HasIndex(b => b.FiscalYear)
            .HasDatabaseName("idx_budget_cycles_year");

        modelBuilder.Entity<BudgetStageStatus>()
            .HasIndex(s => new { s.BudgetCycleId, s.Stage })
            .IsUnique();

        modelBuilder.Entity<BudgetStageStatus>()
            .HasOne(s => s.BudgetCycle)
            .WithMany(b => b.Stages)
            .HasForeignKey(s => s.BudgetCycleId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<BudgetSnapshot>()
            .HasIndex(s => new { s.BudgetCycleId, s.Month })
            .IsUnique();

        modelBuilder.Entity<BudgetSnapshot>()
            .HasOne(s => s.BudgetCycle)
            .WithMany(b => b.Snapshots)
            .HasForeignKey(s => s.BudgetCycleId)
            .OnDelete(DeleteBehavior.Cascade);
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

        foreach (var entry in ChangeTracker.Entries<BudgetCycle>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = now;
                entry.Entity.UpdatedAt = now;
                if (entry.Entity.IsLocked && entry.Entity.LockedAt == null)
                {
                    entry.Entity.LockedAt = now;
                }
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = now;
                if (entry.Entity.IsLocked && entry.Entity.LockedAt == null)
                {
                    entry.Entity.LockedAt = now;
                }
                else if (!entry.Entity.IsLocked)
                {
                    entry.Entity.LockedAt = null;
                }
            }
        }

        foreach (var entry in ChangeTracker.Entries<BudgetSnapshot>())
        {
            if (entry.State == EntityState.Added && entry.Entity.CreatedAt == default)
            {
                entry.Entity.CreatedAt = now;
            }
        }
    }
}
