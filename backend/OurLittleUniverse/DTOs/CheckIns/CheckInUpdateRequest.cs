using System.ComponentModel.DataAnnotations;

namespace LoveUniverse.Api.DTOs.CheckIns;

public sealed class CheckInUpdateRequest
{
    [Range(1, 5)]
    public int ConnectionLevel { get; set; }

    [Range(1, 5)]
    public int EnergyLevel { get; set; }

    [Range(1, 5)]
    public int CommunicationFeeling { get; set; }

    [MaxLength(1000)]
    public string? Note { get; set; }
}
