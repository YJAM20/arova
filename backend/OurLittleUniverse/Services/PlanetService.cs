using LoveUniverse.Api.Data;
using LoveUniverse.Api.DTOs.Planets;
using LoveUniverse.Api.Entities;
using LoveUniverse.Api.Entities.Enums;
using Microsoft.EntityFrameworkCore;

namespace LoveUniverse.Api.Services;

public sealed class PlanetService : IPlanetService
{
    private readonly AppDbContext _dbContext;
    private readonly IPermissionService _permissionService;

    public PlanetService(AppDbContext dbContext, IPermissionService permissionService)
    {
        _dbContext = dbContext;
        _permissionService = permissionService;
    }

    public async Task<ContentServiceResult<IReadOnlyList<PlanetResponse>>> GetPlanetsAsync(CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<IReadOnlyList<PlanetResponse>>.Failure(context.Status, context.ErrorMessage);
        }

        var planets = await _dbContext.Set<PlanetDefinition>()
            .AsNoTracking()
            .Include(planet => planet.Tasks)
            .Where(planet => planet.IsActive)
            .OrderBy(planet => planet.SortOrder)
            .ToListAsync(cancellationToken);

        var mapped = planets.Select(MapPlanetDefinition).ToList();
        return ContentServiceResult<IReadOnlyList<PlanetResponse>>.Success(mapped);
    }

    public async Task<ContentServiceResult<DailyPlanetResponse>> GetTodayPlanetAsync(CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<DailyPlanetResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var dailyPlanet = await _dbContext.Set<DailyCouplePlanet>()
            .AsNoTracking()
            .Include(dp => dp.PlanetDefinition)
                .ThenInclude(pd => pd.Tasks)
            .Include(dp => dp.TaskCompletions)
            .FirstOrDefaultAsync(dp => dp.CoupleId == context.CoupleId && dp.Date == today, cancellationToken);

        if (dailyPlanet is null)
        {
            return ContentServiceResult<DailyPlanetResponse>.Failure(
                ContentServiceStatus.NotFound,
                "No planet has been assigned for today. Roll a planet first.");
        }

        return ContentServiceResult<DailyPlanetResponse>.Success(MapDailyPlanet(dailyPlanet));
    }

    public async Task<ContentServiceResult<DailyPlanetResponse>> RollTodayPlanetAsync(CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<DailyPlanetResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var existing = await _dbContext.Set<DailyCouplePlanet>()
            .AsNoTracking()
            .Include(dp => dp.PlanetDefinition)
                .ThenInclude(pd => pd.Tasks)
            .Include(dp => dp.TaskCompletions)
            .FirstOrDefaultAsync(dp => dp.CoupleId == context.CoupleId && dp.Date == today, cancellationToken);

        if (existing is not null)
        {
            return ContentServiceResult<DailyPlanetResponse>.Success(MapDailyPlanet(existing));
        }

        var activePlanetIds = await _dbContext.Set<PlanetDefinition>()
            .AsNoTracking()
            .Where(planet => planet.IsActive)
            .Select(planet => planet.Id)
            .ToListAsync(cancellationToken);

        if (activePlanetIds.Count == 0)
        {
            return ContentServiceResult<DailyPlanetResponse>.Failure(
                ContentServiceStatus.NotFound,
                "No active planets are available.");
        }

        var randomIndex = Random.Shared.Next(activePlanetIds.Count);
        var selectedPlanetId = activePlanetIds[randomIndex];

        var dailyPlanet = new DailyCouplePlanet
        {
            Id = Guid.NewGuid(),
            CoupleId = context.CoupleId!.Value,
            PlanetDefinitionId = selectedPlanetId,
            Date = today,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Set<DailyCouplePlanet>().Add(dailyPlanet);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var created = await _dbContext.Set<DailyCouplePlanet>()
            .AsNoTracking()
            .Include(dp => dp.PlanetDefinition)
                .ThenInclude(pd => pd.Tasks)
            .Include(dp => dp.TaskCompletions)
            .FirstAsync(dp => dp.Id == dailyPlanet.Id, cancellationToken);

        return ContentServiceResult<DailyPlanetResponse>.Success(MapDailyPlanet(created));
    }

    public async Task<ContentServiceResult<DailyPlanetResponse>> CompleteTaskAsync(
        CompleteTaskRequest request,
        CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<DailyPlanetResponse>.Failure(context.Status, context.ErrorMessage);
        }

        if (string.IsNullOrWhiteSpace(request.TaskKey))
        {
            return ContentServiceResult<DailyPlanetResponse>.Failure(
                ContentServiceStatus.BadRequest,
                "Task key is required.");
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var dailyPlanet = await _dbContext.Set<DailyCouplePlanet>()
            .Include(dp => dp.PlanetDefinition)
                .ThenInclude(pd => pd.Tasks)
            .Include(dp => dp.TaskCompletions)
            .FirstOrDefaultAsync(dp => dp.CoupleId == context.CoupleId && dp.Date == today, cancellationToken);

        if (dailyPlanet is null)
        {
            return ContentServiceResult<DailyPlanetResponse>.Failure(
                ContentServiceStatus.NotFound,
                "No planet has been assigned for today. Roll a planet first.");
        }

        var taskDefinition = dailyPlanet.PlanetDefinition.Tasks
            .FirstOrDefault(task => task.TaskKey == request.TaskKey.Trim());

        if (taskDefinition is null)
        {
            return ContentServiceResult<DailyPlanetResponse>.Failure(
                ContentServiceStatus.BadRequest,
                "The specified task does not belong to today's planet.");
        }

        var alreadyCompleted = dailyPlanet.TaskCompletions
            .Any(tc => tc.UserId == context.UserId && tc.TaskKey == request.TaskKey.Trim());

        if (alreadyCompleted)
        {
            return ContentServiceResult<DailyPlanetResponse>.Failure(
                ContentServiceStatus.BadRequest,
                "You have already completed this task today.");
        }

        var now = DateTime.UtcNow;

        var completion = new DailyPlanetTaskCompletion
        {
            Id = Guid.NewGuid(),
            DailyCouplePlanetId = dailyPlanet.Id,
            UserId = context.UserId!.Value,
            TaskKey = request.TaskKey.Trim(),
            PointsAwarded = taskDefinition.PointsReward,
            CompletedAt = now
        };

        _dbContext.Set<DailyPlanetTaskCompletion>().Add(completion);

        var ledgerEntry = new RelationshipPointLedger
        {
            Id = Guid.NewGuid(),
            CoupleId = context.CoupleId!.Value,
            UserId = context.UserId!.Value,
            ActionType = "PlanetTaskCompleted",
            Points = taskDefinition.PointsReward,
            Reason = $"Completed planet task: {taskDefinition.Title}",
            SourceType = "DailyPlanetTaskCompletion",
            SourceId = completion.Id,
            CreatedAt = now
        };

        _dbContext.Set<RelationshipPointLedger>().Add(ledgerEntry);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var updated = await _dbContext.Set<DailyCouplePlanet>()
            .AsNoTracking()
            .Include(dp => dp.PlanetDefinition)
                .ThenInclude(pd => pd.Tasks)
            .Include(dp => dp.TaskCompletions)
            .FirstAsync(dp => dp.Id == dailyPlanet.Id, cancellationToken);

        return ContentServiceResult<DailyPlanetResponse>.Success(MapDailyPlanet(updated));
    }

    private async Task<AccessContext> GetAccessContextAsync(CancellationToken cancellationToken)
    {
        var userId = _permissionService.GetCurrentUserId();
        if (userId is null)
        {
            return AccessContext.Failure(ContentServiceStatus.Unauthorized, "Please sign in to continue.");
        }

        var coupleId = await _permissionService.GetCurrentUserCoupleIdAsync(cancellationToken);
        var role = await _permissionService.GetCurrentUserRoleAsync(cancellationToken);
        if (coupleId is null || role is null)
        {
            return AccessContext.Failure(ContentServiceStatus.NotFound, "Create or join a couple space first.");
        }

        return AccessContext.Success(userId.Value, coupleId.Value, role.Value);
    }

    private static PlanetResponse MapPlanetDefinition(PlanetDefinition planet)
    {
        return new PlanetResponse
        {
            Id = planet.Id,
            Key = planet.Key,
            Name = planet.Name,
            Description = planet.Description,
            ThemeKey = planet.ThemeKey,
            Purpose = planet.Purpose,
            Difficulty = planet.Difficulty,
            EstimatedMinutes = planet.EstimatedMinutes,
            PointsReward = planet.PointsReward,
            SortOrder = planet.SortOrder,
            Tasks = planet.Tasks
                .OrderBy(task => task.SortOrder)
                .Select(task => new PlanetTaskResponse
                {
                    TaskKey = task.TaskKey,
                    Title = task.Title,
                    Description = task.Description,
                    PointsReward = task.PointsReward,
                    IsRequired = task.IsRequired,
                    SortOrder = task.SortOrder
                })
                .ToList()
        };
    }

    private static DailyPlanetResponse MapDailyPlanet(DailyCouplePlanet dailyPlanet)
    {
        return new DailyPlanetResponse
        {
            Id = dailyPlanet.Id,
            Date = dailyPlanet.Date,
            Planet = MapPlanetDefinition(dailyPlanet.PlanetDefinition),
            Completions = dailyPlanet.TaskCompletions
                .OrderBy(tc => tc.CompletedAt)
                .Select(tc => new TaskCompletionResponse
                {
                    UserId = tc.UserId,
                    TaskKey = tc.TaskKey,
                    PointsAwarded = tc.PointsAwarded,
                    CompletedAt = tc.CompletedAt
                })
                .ToList(),
            TotalPointsEarned = dailyPlanet.TaskCompletions.Sum(tc => tc.PointsAwarded)
        };
    }

    private sealed record AccessContext(
        bool Succeeded,
        Guid? UserId,
        Guid? CoupleId,
        CoupleRole? Role,
        ContentServiceStatus Status,
        string ErrorMessage)
    {
        public static AccessContext Success(Guid userId, Guid coupleId, CoupleRole role)
        {
            return new AccessContext(true, userId, coupleId, role, ContentServiceStatus.Success, string.Empty);
        }

        public static AccessContext Failure(ContentServiceStatus status, string errorMessage)
        {
            return new AccessContext(false, null, null, null, status, errorMessage);
        }
    }
}
