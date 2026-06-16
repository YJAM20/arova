using LoveUniverse.Api.Entities.Enums;

namespace LoveUniverse.Api.Entities;

public sealed class AccountVerificationCode
{
    public Guid Id { get; set; }

    public Guid? UserId { get; set; }

    public VerificationChannel Channel { get; set; }

    public string Destination { get; set; } = string.Empty;

    public string CodeHash { get; set; } = string.Empty;

    public VerificationPurpose Purpose { get; set; }

    public DateTime ExpiresAt { get; set; }

    public DateTime? UsedAt { get; set; }

    public int Attempts { get; set; }

    public DateTime CreatedAt { get; set; }

    public AppUser? User { get; set; }
}
