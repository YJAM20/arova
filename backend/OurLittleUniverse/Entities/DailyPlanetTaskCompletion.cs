namespace LoveUniverse.Api.Entities;

public sealed class DailyPlanetTaskCompletion
{
    public Guid Id { get; set; }

    public Guid DailyCouplePlanetId { get; set; }

    public Guid UserId { get; set; }

    public string TaskKey { get; set; } = string.Empty;

    public int PointsAwarded { get; set; }

    public DateTime CompletedAt { get; set; }

    public DailyCouplePlanet DailyCouplePlanet { get; set; } = null!;

    public AppUser User { get; set; } = null!;
}
