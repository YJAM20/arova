namespace LoveUniverse.Api.Entities;

public sealed class PlanetTaskDefinition
{
    public Guid Id { get; set; }

    public Guid PlanetDefinitionId { get; set; }

    public string TaskKey { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int PointsReward { get; set; }

    public bool IsRequired { get; set; }

    public int SortOrder { get; set; }

    public PlanetDefinition PlanetDefinition { get; set; } = null!;
}
