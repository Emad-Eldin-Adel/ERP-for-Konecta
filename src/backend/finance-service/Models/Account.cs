using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinanceService.Models;

[Table("accounts")]
public class Account
{
    [Key]
    [Column("id")]
    public long Id { get; set; }

    [Column("user_id")]
    public long? UserId { get; set; }

    [MaxLength(255)]
    [Column("username")]
    public string? Username { get; set; }

    [MaxLength(255)]
    [Column("email")]
    public string? Email { get; set; }

    [Required]
    [MaxLength(64)]
    [Column("account_number")]
    public string AccountNumber { get; set; } = string.Empty;

    [Required]
    [Column("card_type")]
    public CardType CardType { get; set; }

    [Column("active")]
    public bool Active { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
