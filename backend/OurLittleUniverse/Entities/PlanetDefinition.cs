namespace LoveUniverse.Api.Entities;

public sealed class PlanetDefinition
{
    public Guid Id { get; set; }

    public string Key { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string ThemeKey { get; set; } = string.Empty;

    public string Purpose { get; set; } = string.Empty;

    public string Difficulty { get; set; } = string.Empty;

    public int EstimatedMinutes { get; set; }

    public int PointsReward { get; set; }

    public bool IsActive { get; set; } = true;

    public int SortOrder { get; set; }

    public ICollection<PlanetTaskDefinition> Tasks { get; set; } = new List<PlanetTaskDefinition>();

    public ICollection<DailyCouplePlanet> DailyAssignments { get; set; } = new List<DailyCouplePlanet>();
}
