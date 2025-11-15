using System;
using FinanceService.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace FinanceService.Migrations;

[DbContext(typeof(FinanceDbContext))]
[Migration("20241115111500_AddBudgetingModule")]
public partial class AddBudgetingModule : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "budget_cycles",
            columns: table => new
            {
                id = table.Column<long>(type: "bigint", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                fiscal_year = table.Column<int>(type: "integer", nullable: false),
                annual_target = table.Column<decimal>(type: "numeric", nullable: true),
                approved_amount = table.Column<decimal>(type: "numeric", nullable: true),
                ytd_actuals = table.Column<decimal>(type: "numeric", nullable: true),
                latest_forecast = table.Column<decimal>(type: "numeric", nullable: true),
                owner = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                notes = table.Column<string>(type: "text", nullable: true),
                is_locked = table.Column<bool>(type: "boolean", nullable: false),
                locked_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_budget_cycles", x => x.id);
            });

        migrationBuilder.CreateTable(
            name: "budget_snapshots",
            columns: table => new
            {
                id = table.Column<long>(type: "bigint", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                budget_cycle_id = table.Column<long>(type: "bigint", nullable: false),
                month = table.Column<DateOnly>(type: "date", nullable: false),
                budget_amount = table.Column<decimal>(type: "numeric", nullable: true),
                actual_amount = table.Column<decimal>(type: "numeric", nullable: true),
                forecast_amount = table.Column<decimal>(type: "numeric", nullable: true),
                notes = table.Column<string>(type: "text", nullable: true),
                created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_budget_snapshots", x => x.id);
                table.ForeignKey(
                    name: "FK_budget_snapshots_budget_cycles_budget_cycle_id",
                    column: x => x.budget_cycle_id,
                    principalTable: "budget_cycles",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "budget_stage_status",
            columns: table => new
            {
                id = table.Column<long>(type: "bigint", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                budget_cycle_id = table.Column<long>(type: "bigint", nullable: false),
                stage = table.Column<int>(type: "integer", nullable: false),
                state = table.Column<int>(type: "integer", nullable: false),
                owner = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                notes = table.Column<string>(type: "text", nullable: true),
                started_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                completed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_budget_stage_status", x => x.id);
                table.ForeignKey(
                    name: "FK_budget_stage_status_budget_cycles_budget_cycle_id",
                    column: x => x.budget_cycle_id,
                    principalTable: "budget_cycles",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "idx_budget_cycles_year",
            table: "budget_cycles",
            column: "fiscal_year");

        migrationBuilder.CreateIndex(
            name: "IX_budget_snapshots_budget_cycle_id_month",
            table: "budget_snapshots",
            columns: new[] { "budget_cycle_id", "month" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_budget_stage_status_budget_cycle_id_stage",
            table: "budget_stage_status",
            columns: new[] { "budget_cycle_id", "stage" },
            unique: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "budget_snapshots");

        migrationBuilder.DropTable(
            name: "budget_stage_status");

        migrationBuilder.DropTable(
            name: "budget_cycles");
    }
}
