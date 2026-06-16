namespace LoveUniverse.Api.DTOs.Profile;

public sealed class ContentSafetyResponse
{
    public bool CanEnableMatureMode { get; set; }

    public bool MatureContentEnabled { get; set; }

    public string MatureContentReason { get; set; } = string.Empty;
}
