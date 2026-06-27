namespace LoveUniverse.Api.DTOs.CheckIns;

public sealed class CheckInResponse
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string UserDisplayName { get; set; } = string.Empty;
    public string DateKey { get; set; } = string.Empty;
    public int ConnectionLevel { get; set; }
    public int EnergyLevel { get; set; }
    public int CommunicationFeeling { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
