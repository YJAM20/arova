namespace LoveUniverse.Api.Entities;

public sealed class DailyCouplePlanet
{
    public Guid Id { get; set; }

    public Guid CoupleId { get; set; }

    public Guid PlanetDefinitionId { get; set; }

    public DateOnly Date { get; set; }

    public DateTime CreatedAt { get; set; }

    public Couple Couple { get; set; } = null!;

    public PlanetDefinition PlanetDefinition { get; set; } = null!;

    public ICollection<DailyPlanetTaskCompletion> TaskCompletions { get; set; } = new List<DailyPlanetTaskCompletion>();
}
