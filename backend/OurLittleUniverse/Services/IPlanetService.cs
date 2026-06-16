using LoveUniverse.Api.DTOs.Planets;

namespace LoveUniverse.Api.Services;

public interface IPlanetService
{
    Task<ContentServiceResult<IReadOnlyList<PlanetResponse>>> GetPlanetsAsync(CancellationToken cancellationToken = default);
    Task<ContentServiceResult<DailyPlanetResponse>> GetTodayPlanetAsync(CancellationToken cancellationToken = default);
    Task<ContentServiceResult<DailyPlanetResponse>> RollTodayPlanetAsync(CancellationToken cancellationToken = default);
    Task<ContentServiceResult<DailyPlanetResponse>> CompleteTaskAsync(CompleteTaskRequest request, CancellationToken cancellationToken = default);
}
