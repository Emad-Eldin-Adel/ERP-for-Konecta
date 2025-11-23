using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace FinanceService.Migrations
{
    /// <inheritdoc />
    public partial class InitialFinanceSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "accounts",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<long>(type: "bigint", nullable: true),
                    username = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    account_number = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    card_type = table.Column<int>(type: "integer", nullable: false),
                    active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_accounts", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "expenses",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    submitted_by = table.Column<long>(type: "bigint", nullable: true),
                    category = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    amount = table.Column<decimal>(type: "numeric", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<int>(type: "integer", nullable: false),
                    approved_by = table.Column<long>(type: "bigint", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    department = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    expense_date = table.Column<DateOnly>(type: "date", nullable: true),
                    source = table.Column<int>(type: "integer", nullable: false),
                    external_ref = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_expenses", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "invoices",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    client_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    invoice_date = table.Column<DateOnly>(type: "date", nullable: true),
                    amount = table.Column<decimal>(type: "numeric", nullable: true),
                    status = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    untaxed_total = table.Column<decimal>(type: "numeric", nullable: true),
                    tax_total = table.Column<decimal>(type: "numeric", nullable: true),
                    withholding_total = table.Column<decimal>(type: "numeric", nullable: true),
                    grand_total = table.Column<decimal>(type: "numeric", nullable: true),
                    pdf_file_name = table.Column<string>(type: "text", nullable: true),
                    pdf_content_type = table.Column<string>(type: "text", nullable: true),
                    pdf_data = table.Column<byte[]>(type: "bytea", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_invoices", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "payroll",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    employee_id = table.Column<long>(type: "bigint", nullable: false),
                    period = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    base_salary = table.Column<decimal>(type: "numeric", nullable: true),
                    bonuses = table.Column<decimal>(type: "numeric", nullable: true),
                    deductions = table.Column<decimal>(type: "numeric", nullable: true),
                    net_salary = table.Column<decimal>(type: "numeric", nullable: true),
                    processed_date = table.Column<DateOnly>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_payroll", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "invoice_items",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    invoice_id = table.Column<long>(type: "bigint", nullable: false),
                    product = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    account = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    due_date = table.Column<DateOnly>(type: "date", nullable: true),
                    quantity = table.Column<decimal>(type: "numeric", nullable: true),
                    price = table.Column<decimal>(type: "numeric", nullable: true),
                    discount_percent = table.Column<decimal>(type: "numeric", nullable: true),
                    tax_percent = table.Column<decimal>(type: "numeric", nullable: true),
                    wh_percent = table.Column<decimal>(type: "numeric", nullable: true),
                    base_amount = table.Column<decimal>(type: "numeric", nullable: true),
                    tax_amount = table.Column<decimal>(type: "numeric", nullable: true),
                    withholding = table.Column<decimal>(type: "numeric", nullable: true),
                    line_total = table.Column<decimal>(type: "numeric", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_invoice_items", x => x.id);
                    table.ForeignKey(
                        name: "FK_invoice_items_invoices_invoice_id",
                        column: x => x.invoice_id,
                        principalTable: "invoices",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "idx_accounts_email",
                table: "accounts",
                column: "email");

            migrationBuilder.CreateIndex(
                name: "idx_accounts_username",
                table: "accounts",
                column: "username");

            migrationBuilder.CreateIndex(
                name: "IX_expenses_department_category_expense_date",
                table: "expenses",
                columns: new[] { "department", "category", "expense_date" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_invoice_items_invoice_id",
                table: "invoice_items",
                column: "invoice_id");

            migrationBuilder.CreateIndex(
                name: "IX_payroll_employee_id_period",
                table: "payroll",
                columns: new[] { "employee_id", "period" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "accounts");

            migrationBuilder.DropTable(
                name: "expenses");

            migrationBuilder.DropTable(
                name: "invoice_items");

            migrationBuilder.DropTable(
                name: "payroll");

            migrationBuilder.DropTable(
                name: "invoices");
        }
    }
}
