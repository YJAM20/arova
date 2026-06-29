using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using LoveUniverse.Api.Data;
using LoveUniverse.Api.Entities;
using LoveUniverse.Api.Entities.Enums;
using LoveUniverse.Api.Services;
using LoveUniverse.Api.DTOs.CoupleGoals;
using LoveUniverse.Api.DTOs.RelationshipScore;
using Xunit;

namespace OurLittleUniverse.Tests;

public class CoupleGoalsTests
{
    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        var context = new AppDbContext(options);
        context.Database.EnsureCreated();
        return context;
    }

    private class TestPermissionService : IPermissionService
    {
        public Guid? UserId { get; set; }
        public Guid? CoupleId { get; set; }
        public CoupleRole? Role { get; set; }

        public Guid? GetCurrentUserId() => UserId;

        public Task<Guid?> GetCurrentUserCoupleIdAsync(CancellationToken cancellationToken = default)
            => Task.FromResult(CoupleId);

        public Task<CoupleRole?> GetCurrentUserRoleAsync(CancellationToken cancellationToken = default)
            => Task.FromResult(Role);

        public Task<bool> IsCurrentUserOwnerAsync(CancellationToken cancellationToken = default)
            => Task.FromResult(Role == CoupleRole.Owner);

        public Task<bool> EnsureUserBelongsToCoupleAsync(Guid coupleId, CancellationToken cancellationToken = default)
            => Task.FromResult(CoupleId == coupleId);

        public Task<bool> CanEditContentAsync(Guid createdByUserId, CancellationToken cancellationToken = default)
            => Task.FromResult(UserId == createdByUserId);
    }

    private class TestRelationshipScoreService : IRelationshipScoreService
    {
        public List<AwardPointsRequest> AwardRequests { get; } = new();

        public Task<ContentServiceResult<RelationshipScoreResponse>> GetScoreAsync(CancellationToken cancellationToken = default)
        {
            return Task.FromResult(ContentServiceResult<RelationshipScoreResponse>.Success(new RelationshipScoreResponse()));
        }

        public Task<ContentServiceResult<IReadOnlyList<PointLedgerEntryResponse>>> GetLedgerAsync(CancellationToken cancellationToken = default)
        {
            return Task.FromResult(ContentServiceResult<IReadOnlyList<PointLedgerEntryResponse>>.Success(new List<PointLedgerEntryResponse>()));
        }

        public Task<ContentServiceResult<IReadOnlyList<DailyTaskResponse>>> GetDailyTasksAsync(CancellationToken cancellationToken = default)
        {
            return Task.FromResult(ContentServiceResult<IReadOnlyList<DailyTaskResponse>>.Success(new List<DailyTaskResponse>()));
        }

        public Task<ContentServiceResult<DailyTaskResponse>> CompleteDailyTaskAsync(Guid taskId, CancellationToken cancellationToken = default)
        {
            return Task.FromResult(ContentServiceResult<DailyTaskResponse>.Success(new DailyTaskResponse()));
        }

        public Task<ContentServiceResult<AwardPointsResponse>> AwardPointsAsync(AwardPointsRequest request, CancellationToken cancellationToken = default)
        {
            AwardRequests.Add(request);
            return Task.FromResult(ContentServiceResult<AwardPointsResponse>.Success(new AwardPointsResponse
            {
                Id = Guid.NewGuid(),
                ActionType = request.ActionType,
                Points = request.Points,
                Reason = request.Reason,
                SourceType = request.SourceType,
                CreatedAt = DateTime.UtcNow
            }));
        }
    }

    [Fact]
    public async Task User_CanCreate_SharedGoal()
    {
        // Arrange
        using var context = CreateContext();
        var userId = Guid.NewGuid();
        var coupleId = Guid.NewGuid();
        context.AppUsers.Add(new AppUser { Id = userId, Email = "u1@arova.io", Username = "u1", PasswordHash = "hash", CreatedAt = DateTime.UtcNow });
        context.Couples.Add(new Couple { Id = coupleId, Name = "Couple 1", CreatedByUserId = userId, CreatedAt = DateTime.UtcNow });
        await context.SaveChangesAsync();

        var permission = new TestPermissionService { UserId = userId, CoupleId = coupleId, Role = CoupleRole.Owner };
        var scoreService = new TestRelationshipScoreService();
        var service = new CoupleGoalService(context, permission, scoreService);

        var request = new CoupleGoalCreateRequest
        {
            Title = "Save for Italy",
            Description = "Save 2000 USD",
            Category = "finance",
            Status = "in-progress",
            IsPrivate = false
        };

        // Act
        var result = await service.CreateGoalAsync(request);

        // Assert
        Assert.True(result.Succeeded);
        Assert.Equal("Save for Italy", result.Value.Title);
        Assert.Equal("finance", result.Value.Category);
        Assert.Equal("in-progress", result.Value.Status);
        Assert.False(result.Value.IsPrivate);
        Assert.Equal(0.0, result.Value.ProgressPercent);
        Assert.Single(scoreService.AwardRequests);
        Assert.Equal("goal-created", scoreService.AwardRequests[0].ActionType);
    }

    [Fact]
    public async Task User_CanCreate_PrivateGoal()
    {
        // Arrange
        using var context = CreateContext();
        var userId = Guid.NewGuid();
        var coupleId = Guid.NewGuid();
        context.AppUsers.Add(new AppUser { Id = userId, Email = "u1@arova.io", Username = "u1", PasswordHash = "hash", CreatedAt = DateTime.UtcNow });
        context.Couples.Add(new Couple { Id = coupleId, Name = "Couple 1", CreatedByUserId = userId, CreatedAt = DateTime.UtcNow });
        await context.SaveChangesAsync();

        var permission = new TestPermissionService { UserId = userId, CoupleId = coupleId, Role = CoupleRole.Owner };
        var scoreService = new TestRelationshipScoreService();
        var service = new CoupleGoalService(context, permission, scoreService);

        var request = new CoupleGoalCreateRequest
        {
            Title = "Surprise anniversary card",
            IsPrivate = true
        };

        // Act
        var result = await service.CreateGoalAsync(request);

        // Assert
        Assert.True(result.Succeeded);
        Assert.True(result.Value.IsPrivate);
    }

    [Fact]
    public async Task Partner_CanView_SharedGoal()
    {
        // Arrange
        using var context = CreateContext();
        var userId1 = Guid.NewGuid();
        var userId2 = Guid.NewGuid();
        var coupleId = Guid.NewGuid();

        context.AppUsers.Add(new AppUser { Id = userId1, Email = "u1@arova.io", Username = "u1", PasswordHash = "hash", CreatedAt = DateTime.UtcNow });
        context.AppUsers.Add(new AppUser { Id = userId2, Email = "u2@arova.io", Username = "u2", PasswordHash = "hash", CreatedAt = DateTime.UtcNow });
        context.Couples.Add(new Couple { Id = coupleId, Name = "Couple 1", CreatedByUserId = userId1, CreatedAt = DateTime.UtcNow });
        await context.SaveChangesAsync();

        var permissionUser1 = new TestPermissionService { UserId = userId1, CoupleId = coupleId, Role = CoupleRole.Owner };
        var permissionUser2 = new TestPermissionService { UserId = userId2, CoupleId = coupleId, Role = CoupleRole.Partner };
        
        var scoreService = new TestRelationshipScoreService();
        var serviceUser1 = new CoupleGoalService(context, permissionUser1, scoreService);
        var serviceUser2 = new CoupleGoalService(context, permissionUser2, scoreService);

        // User 1 creates shared goal
        var request = new CoupleGoalCreateRequest { Title = "Shared Trip", IsPrivate = false };
        var createResult = await serviceUser1.CreateGoalAsync(request);

        // Act
        var listResult = await serviceUser2.GetGoalsAsync();
        var getByIdResult = await serviceUser2.GetGoalByIdAsync(createResult.Value.Id);

        // Assert
        Assert.True(listResult.Succeeded);
        Assert.Single(listResult.Value);
        Assert.Equal("Shared Trip", listResult.Value[0].Title);

        Assert.True(getByIdResult.Succeeded);
        Assert.Equal("Shared Trip", getByIdResult.Value.Title);
    }

    [Fact]
    public async Task Partner_CannotView_PrivateGoal()
    {
        // Arrange
        using var context = CreateContext();
        var userId1 = Guid.NewGuid();
        var userId2 = Guid.NewGuid();
        var coupleId = Guid.NewGuid();

        context.AppUsers.Add(new AppUser { Id = userId1, Email = "u1@arova.io", Username = "u1", PasswordHash = "hash", CreatedAt = DateTime.UtcNow });
        context.AppUsers.Add(new AppUser { Id = userId2, Email = "u2@arova.io", Username = "u2", PasswordHash = "hash", CreatedAt = DateTime.UtcNow });
        context.Couples.Add(new Couple { Id = coupleId, Name = "Couple 1", CreatedByUserId = userId1, CreatedAt = DateTime.UtcNow });
        await context.SaveChangesAsync();

        var permissionUser1 = new TestPermissionService { UserId = userId1, CoupleId = coupleId, Role = CoupleRole.Owner };
        var permissionUser2 = new TestPermissionService { UserId = userId2, CoupleId = coupleId, Role = CoupleRole.Partner };
        
        var scoreService = new TestRelationshipScoreService();
        var serviceUser1 = new CoupleGoalService(context, permissionUser1, scoreService);
        var serviceUser2 = new CoupleGoalService(context, permissionUser2, scoreService);

        // User 1 creates private goal
        var request = new CoupleGoalCreateRequest { Title = "Secret Gift", IsPrivate = true };
        var createResult = await serviceUser1.CreateGoalAsync(request);

        // Act
        var listResult = await serviceUser2.GetGoalsAsync();
        var getByIdResult = await serviceUser2.GetGoalByIdAsync(createResult.Value.Id);

        // Assert
        Assert.True(listResult.Succeeded);
        Assert.Empty(listResult.Value); // Partner should see nothing

        Assert.False(getByIdResult.Succeeded); // Partner direct fetch is NotFound
        Assert.Equal(ContentServiceStatus.NotFound, getByIdResult.Status);
    }

    [Fact]
    public async Task CrossCoupleAccess_IsBlocked()
    {
        // Arrange
        using var context = CreateContext();
        var coupleId1 = Guid.NewGuid();
        var coupleId2 = Guid.NewGuid();
        var userId1 = Guid.NewGuid();
        var userId2 = Guid.NewGuid();

        context.AppUsers.Add(new AppUser { Id = userId1, Email = "u1@arova.io", Username = "u1", PasswordHash = "hash", CreatedAt = DateTime.UtcNow });
        context.AppUsers.Add(new AppUser { Id = userId2, Email = "u2@arova.io", Username = "u2", PasswordHash = "hash", CreatedAt = DateTime.UtcNow });
        context.Couples.Add(new Couple { Id = coupleId1, Name = "Couple 1", CreatedByUserId = userId1, CreatedAt = DateTime.UtcNow });
        context.Couples.Add(new Couple { Id = coupleId2, Name = "Couple 2", CreatedByUserId = userId2, CreatedAt = DateTime.UtcNow });
        await context.SaveChangesAsync();

        var permissionUser1 = new TestPermissionService { UserId = userId1, CoupleId = coupleId1, Role = CoupleRole.Owner };
        var permissionUser2 = new TestPermissionService { UserId = userId2, CoupleId = coupleId2, Role = CoupleRole.Owner };
        
        var scoreService = new TestRelationshipScoreService();
        var serviceUser1 = new CoupleGoalService(context, permissionUser1, scoreService);
        var serviceUser2 = new CoupleGoalService(context, permissionUser2, scoreService);

        // User 1 creates goal in Couple 1
        var request = new CoupleGoalCreateRequest { Title = "Couple 1 Goal", IsPrivate = false };
        var createResult = await serviceUser1.CreateGoalAsync(request);

        // Act & Assert
        // User 2 tries to fetch
        var listResult = await serviceUser2.GetGoalsAsync();
        Assert.True(listResult.Succeeded);
        Assert.Empty(listResult.Value);

        var getByIdResult = await serviceUser2.GetGoalByIdAsync(createResult.Value.Id);
        Assert.False(getByIdResult.Succeeded);
        Assert.Equal(ContentServiceStatus.NotFound, getByIdResult.Status);
    }

    [Fact]
    public async Task Milestone_Operations_UpdateProgressAndTriggerRewards()
    {
        // Arrange
        using var context = CreateContext();
        var userId = Guid.NewGuid();
        var coupleId = Guid.NewGuid();
        context.AppUsers.Add(new AppUser { Id = userId, Email = "u1@arova.io", Username = "u1", PasswordHash = "hash", CreatedAt = DateTime.UtcNow });
        context.Couples.Add(new Couple { Id = coupleId, Name = "Couple 1", CreatedByUserId = userId, CreatedAt = DateTime.UtcNow });
        await context.SaveChangesAsync();

        var permission = new TestPermissionService { UserId = userId, CoupleId = coupleId, Role = CoupleRole.Owner };
        var scoreService = new TestRelationshipScoreService();
        var service = new CoupleGoalService(context, permission, scoreService);

        var goalRequest = new CoupleGoalCreateRequest { Title = "Read Book" };
        var goalResult = await service.CreateGoalAsync(goalRequest);
        var goalId = goalResult.Value.Id;

        // Act & Assert 1: Add milestone 1
        var ms1 = await service.CreateMilestoneAsync(goalId, new MilestoneCreateRequest { Title = "Read Chapter 1" });
        Assert.True(ms1.Succeeded);
        
        var fetchGoal = await service.GetGoalByIdAsync(goalId);
        Assert.Equal(0.0, fetchGoal.Value.ProgressPercent); // 0/1 completed

        // Add milestone 2
        var ms2 = await service.CreateMilestoneAsync(goalId, new MilestoneCreateRequest { Title = "Read Chapter 2" });
        Assert.True(ms2.Succeeded);

        // Complete milestone 1
        scoreService.AwardRequests.Clear();
        var updateMs1 = await service.UpdateMilestoneAsync(goalId, ms1.Value.Id, new MilestoneUpdateRequest { Title = "Read Chapter 1", IsCompleted = true });
        Assert.True(updateMs1.Succeeded);

        fetchGoal = await service.GetGoalByIdAsync(goalId);
        Assert.Equal(50.0, fetchGoal.Value.ProgressPercent); // 1/2 completed
        Assert.Equal("in-progress", fetchGoal.Value.Status);
        
        // Assert milestone completed points awarded
        Assert.Single(scoreService.AwardRequests);
        Assert.Equal("goal-milestone-completed", scoreService.AwardRequests[0].ActionType);

        // Complete milestone 2 -> goal completed
        scoreService.AwardRequests.Clear();
        var updateMs2 = await service.UpdateMilestoneAsync(goalId, ms2.Value.Id, new MilestoneUpdateRequest { Title = "Read Chapter 2", IsCompleted = true });
        Assert.True(updateMs2.Succeeded);

        fetchGoal = await service.GetGoalByIdAsync(goalId);
        Assert.Equal(100.0, fetchGoal.Value.ProgressPercent); // 2/2 completed
        Assert.Equal("completed", fetchGoal.Value.Status);

        // Assert points: milestone points (5) and goal points (30) both awarded
        Assert.Equal(2, scoreService.AwardRequests.Count);
        Assert.Contains(scoreService.AwardRequests, r => r.ActionType == "goal-milestone-completed");
        Assert.Contains(scoreService.AwardRequests, r => r.ActionType == "goal-completed");
    }

    [Fact]
    public async Task Duplicate_InvalidOperations_AreRejected()
    {
        // Arrange
        using var context = CreateContext();
        var userId = Guid.NewGuid();
        var coupleId = Guid.NewGuid();
        context.AppUsers.Add(new AppUser { Id = userId, Email = "u1@arova.io", Username = "u1", PasswordHash = "hash", CreatedAt = DateTime.UtcNow });
        context.Couples.Add(new Couple { Id = coupleId, Name = "Couple 1", CreatedByUserId = userId, CreatedAt = DateTime.UtcNow });
        await context.SaveChangesAsync();

        var permission = new TestPermissionService { UserId = userId, CoupleId = coupleId, Role = CoupleRole.Owner };
        var scoreService = new TestRelationshipScoreService();
        var service = new CoupleGoalService(context, permission, scoreService);

        // 1. Create with empty title is Bad Request
        var emptyResult = await service.CreateGoalAsync(new CoupleGoalCreateRequest { Title = "" });
        Assert.False(emptyResult.Succeeded);
        Assert.Equal(ContentServiceStatus.BadRequest, emptyResult.Status);

        // 2. Create milestone with empty title is Bad Request
        var goalResult = await service.CreateGoalAsync(new CoupleGoalCreateRequest { Title = "valid goal" });
        var msResult = await service.CreateMilestoneAsync(goalResult.Value.Id, new MilestoneCreateRequest { Title = "" });
        Assert.False(msResult.Succeeded);
        Assert.Equal(ContentServiceStatus.BadRequest, msResult.Status);
    }
}
