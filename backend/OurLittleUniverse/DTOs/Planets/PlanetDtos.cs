namespace LoveUniverse.Api.DTOs.Planets;

public sealed class PlanetResponse
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

    public int SortOrder { get; set; }

    public IReadOnlyList<PlanetTaskResponse> Tasks { get; set; } = [];
}

public sealed class PlanetTaskResponse
{
    public string TaskKey { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int PointsReward { get; set; }

    public bool IsRequired { get; set; }

    public int SortOrder { get; set; }
}

public sealed class DailyPlanetResponse
{
    public Guid Id { get; set; }

    public DateOnly Date { get; set; }

    public PlanetResponse Planet { get; set; } = new();

    public IReadOnlyList<TaskCompletionResponse> Completions { get; set; } = [];

    public int TotalPointsEarned { get; set; }
}

public sealed class TaskCompletionResponse
{
    public Guid UserId { get; set; }

    public string TaskKey { get; set; } = string.Empty;

    public int PointsAwarded { get; set; }

    public DateTime CompletedAt { get; set; }
}

public sealed class CompleteTaskRequest
{
    public string TaskKey { get; set; } = string.Empty;
}
