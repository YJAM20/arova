using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using LoveUniverse.Api.Data;
using LoveUniverse.Api.Entities;
using LoveUniverse.Api.Entities.Enums;
using LoveUniverse.Api.Services;
using LoveUniverse.Api.DTOs.DailyQuestions;
using LoveUniverse.Api.DTOs.CheckIns;
using Xunit;

namespace OurLittleUniverse.Tests;

public class DailyQuestionsAndCheckInsTests
{
    private static AppDbContext CreateContext()
    {
        var connection = new SqliteConnection("Filename=:memory:");
        connection.Open();
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(connection)
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

    [Fact]
    public async Task User_CannotAccessAnotherCouple_DailyQuestionAnswers()
    {
        // Arrange
        using var context = CreateContext();
        var coupleId1 = Guid.NewGuid();
        var coupleId2 = Guid.NewGuid();
        var userId1 = Guid.NewGuid();
        var userId2 = Guid.NewGuid();

        // Seed users & couples
        context.AppUsers.Add(new AppUser { Id = userId1, Email = "u1@test.com", Username = "u1", PasswordHash = "hash", CreatedAt = DateTime.UtcNow });
        context.AppUsers.Add(new AppUser { Id = userId2, Email = "u2@test.com", Username = "u2", PasswordHash = "hash", CreatedAt = DateTime.UtcNow });
        context.Couples.Add(new Couple { Id = coupleId1, Name = "C1", CreatedByUserId = userId1, CreatedAt = DateTime.UtcNow });
        context.Couples.Add(new Couple { Id = coupleId2, Name = "C2", CreatedByUserId = userId2, CreatedAt = DateTime.UtcNow });

        var question = new DailyQuestion { Id = Guid.NewGuid(), CoupleId = coupleId2, Prompt = "Q?", Category = "deep", CreatedAt = DateTime.UtcNow };
        context.DailyQuestions.Add(question);

        var answer = new DailyQuestionAnswer { Id = Guid.NewGuid(), CoupleId = coupleId2, QuestionId = question.Id, UserId = userId2, Answer = "Secret", CreatedAt = DateTime.UtcNow };
        context.DailyQuestionAnswers.Add(answer);
        await context.SaveChangesAsync();

        var permissionService = new TestPermissionService { UserId = userId1, CoupleId = coupleId1, Role = CoupleRole.Owner };
        var service = new DailyQuestionService(context, permissionService);

        // Act
        var result = await service.GetHistoryAnswersAsync();

        // Assert
        Assert.True(result.Succeeded);
        Assert.Empty(result.Value);
    }

    [Fact]
    public async Task User_CannotAccessAnotherCouple_CheckIns()
    {
        // Arrange
        using var context = CreateContext();
        var coupleId1 = Guid.NewGuid();
        var coupleId2 = Guid.NewGuid();
        var userId1 = Guid.NewGuid();
        var userId2 = Guid.NewGuid();

        context.AppUsers.Add(new AppUser { Id = userId1, Email = "u1@test.com", Username = "u1", PasswordHash = "hash", CreatedAt = DateTime.UtcNow });
        context.AppUsers.Add(new AppUser { Id = userId2, Email = "u2@test.com", Username = "u2", PasswordHash = "hash", CreatedAt = DateTime.UtcNow });
        context.Couples.Add(new Couple { Id = coupleId1, Name = "C1", CreatedByUserId = userId1, CreatedAt = DateTime.UtcNow });
        context.Couples.Add(new Couple { Id = coupleId2, Name = "C2", CreatedByUserId = userId2, CreatedAt = DateTime.UtcNow });

        var checkIn = new CheckIn { Id = Guid.NewGuid(), CoupleId = coupleId2, UserId = userId2, Mood = 4, Energy = 4, Need = 4, CreatedAt = DateTime.UtcNow };
        context.CheckIns.Add(checkIn);
        await context.SaveChangesAsync();

        var permissionService = new TestPermissionService { UserId = userId1, CoupleId = coupleId1, Role = CoupleRole.Owner };
        var service = new CheckInService(context, permissionService);

        // Act
        var result = await service.GetCheckInsAsync();

        // Assert
        Assert.True(result.Succeeded);
        Assert.Empty(result.Value);
    }

    [Fact]
    public async Task User_CanCreateOwnCheckIn()
    {
        // Arrange
        using var context = CreateContext();
        var coupleId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        context.AppUsers.Add(new AppUser { Id = userId, Email = "u1@test.com", Username = "u1", PasswordHash = "hash", CreatedAt = DateTime.UtcNow });
        context.Couples.Add(new Couple { Id = coupleId, Name = "C1", CreatedByUserId = userId, CreatedAt = DateTime.UtcNow });
        await context.SaveChangesAsync();

        var permissionService = new TestPermissionService { UserId = userId, CoupleId = coupleId, Role = CoupleRole.Owner };
        var service = new CheckInService(context, permissionService);

        var request = new CheckInCreateRequest { ConnectionLevel = 5, EnergyLevel = 4, CommunicationFeeling = 3, Note = "Feeling good" };

        // Act
        var result = await service.CreateCheckInAsync(request);

        // Assert
        Assert.True(result.Succeeded);
        Assert.NotNull(result.Value);
        Assert.Equal(5, result.Value.ConnectionLevel);
        Assert.Equal(4, result.Value.EnergyLevel);
        Assert.Equal(3, result.Value.CommunicationFeeling);
        Assert.Equal("Feeling good", result.Value.Note);
        Assert.Equal(userId, result.Value.UserId);
    }

    [Fact]
    public async Task User_CanUpdateOwnCheckIn()
    {
        // Arrange
        using var context = CreateContext();
        var coupleId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        context.AppUsers.Add(new AppUser { Id = userId, Email = "u1@test.com", Username = "u1", PasswordHash = "hash", CreatedAt = DateTime.UtcNow });
        context.Couples.Add(new Couple { Id = coupleId, Name = "C1", CreatedByUserId = userId, CreatedAt = DateTime.UtcNow });
        var checkIn = new CheckIn { Id = Guid.NewGuid(), CoupleId = coupleId, UserId = userId, Mood = 2, Energy = 2, Need = 2, CreatedAt = DateTime.UtcNow };
        context.CheckIns.Add(checkIn);
        await context.SaveChangesAsync();

        var permissionService = new TestPermissionService { UserId = userId, CoupleId = coupleId, Role = CoupleRole.Owner };
        var service = new CheckInService(context, permissionService);

        var request = new CheckInUpdateRequest { ConnectionLevel = 5, EnergyLevel = 5, CommunicationFeeling = 5, Note = "Better now" };

        // Act
        var result = await service.UpdateCheckInAsync(checkIn.Id, request);

        // Assert
        Assert.True(result.Succeeded);
        Assert.NotNull(result.Value);
        Assert.Equal(5, result.Value.ConnectionLevel);
        Assert.Equal("Better now", result.Value.Note);
    }

    [Fact]
    public async Task User_CannotUpdatePartnerCheckIn()
    {
        // Arrange
        using var context = CreateContext();
        var coupleId = Guid.NewGuid();
        var userId1 = Guid.NewGuid();
        var userId2 = Guid.NewGuid();

        context.AppUsers.Add(new AppUser { Id = userId1, Email = "u1@test.com", Username = "u1", PasswordHash = "hash", CreatedAt = DateTime.UtcNow });
        context.AppUsers.Add(new AppUser { Id = userId2, Email = "u2@test.com", Username = "u2", PasswordHash = "hash", CreatedAt = DateTime.UtcNow });
        context.Couples.Add(new Couple { Id = coupleId, Name = "C1", CreatedByUserId = userId1, CreatedAt = DateTime.UtcNow });
        var checkIn = new CheckIn { Id = Guid.NewGuid(), CoupleId = coupleId, UserId = userId2, Mood = 2, Energy = 2, Need = 2, CreatedAt = DateTime.UtcNow };
        context.CheckIns.Add(checkIn);
        await context.SaveChangesAsync();

        var permissionService = new TestPermissionService { UserId = userId1, CoupleId = coupleId, Role = CoupleRole.Owner };
        var service = new CheckInService(context, permissionService);

        var request = new CheckInUpdateRequest { ConnectionLevel = 5, EnergyLevel = 5, CommunicationFeeling = 5, Note = "Hacked Note" };

        // Act
        var result = await service.UpdateCheckInAsync(checkIn.Id, request);

        // Assert
        Assert.False(result.Succeeded);
        Assert.Equal(ContentServiceStatus.Forbidden, result.Status);
    }

    [Fact]
    public async Task User_CanAnswerDailyQuestion()
    {
        // Arrange
        using var context = CreateContext();
        var coupleId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        context.AppUsers.Add(new AppUser { Id = userId, Email = "u1@test.com", Username = "u1", PasswordHash = "hash", CreatedAt = DateTime.UtcNow });
        context.Couples.Add(new Couple { Id = coupleId, Name = "C1", CreatedByUserId = userId, CreatedAt = DateTime.UtcNow });
        await context.SaveChangesAsync();

        var permissionService = new TestPermissionService { UserId = userId, CoupleId = coupleId, Role = CoupleRole.Owner };
        var service = new DailyQuestionService(context, permissionService);

        var request = new DailyQuestionAnswerRequest { Answer = "This is my answer." };

        // Act
        var result = await service.AnswerTodayQuestionAsync(request);

        // Assert
        Assert.True(result.Succeeded);
        Assert.NotNull(result.Value);
        Assert.Equal("This is my answer.", result.Value.Answer);
        Assert.Equal(userId, result.Value.UserId);
    }

    [Fact]
    public async Task User_CanUpdateOwnDailyQuestionAnswer()
    {
        // Arrange
        using var context = CreateContext();
        var coupleId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        context.AppUsers.Add(new AppUser { Id = userId, Email = "u1@test.com", Username = "u1", PasswordHash = "hash", CreatedAt = DateTime.UtcNow });
        context.Couples.Add(new Couple { Id = coupleId, Name = "C1", CreatedByUserId = userId, CreatedAt = DateTime.UtcNow });
        
        var permissionService = new TestPermissionService { UserId = userId, CoupleId = coupleId, Role = CoupleRole.Owner };
        var service = new DailyQuestionService(context, permissionService);

        // Answer once
        var firstAnswerResult = await service.AnswerTodayQuestionAsync(new DailyQuestionAnswerRequest { Answer = "First Attempt" });
        Assert.True(firstAnswerResult.Succeeded);

        // Update answer
        var updateRequest = new DailyQuestionAnswerRequest { Answer = "Second Attempt" };

        // Act
        var result = await service.UpdateAnswerAsync(firstAnswerResult.Value.Id, updateRequest);

        // Assert
        Assert.True(result.Succeeded);
        Assert.Equal("Second Attempt", result.Value.Answer);
    }

    [Fact]
    public async Task Validation_RejectsEmptyAnswerOrCheckIn()
    {
        // Arrange
        using var context = CreateContext();
        var coupleId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        context.AppUsers.Add(new AppUser { Id = userId, Email = "u1@test.com", Username = "u1", PasswordHash = "hash", CreatedAt = DateTime.UtcNow });
        context.Couples.Add(new Couple { Id = coupleId, Name = "C1", CreatedByUserId = userId, CreatedAt = DateTime.UtcNow });
        await context.SaveChangesAsync();

        var permissionService = new TestPermissionService { UserId = userId, CoupleId = coupleId, Role = CoupleRole.Owner };
        var checkInService = new CheckInService(context, permissionService);
        var questionService = new DailyQuestionService(context, permissionService);

        // Act & Assert 1: Reject empty answer
        var answerResult = await questionService.AnswerTodayQuestionAsync(new DailyQuestionAnswerRequest { Answer = "   " });
        Assert.False(answerResult.Succeeded);
        Assert.Equal(ContentServiceStatus.BadRequest, answerResult.Status);

        // Act & Assert 2: Reject out of bounds check-in levels
        var checkInResult = await checkInService.CreateCheckInAsync(new CheckInCreateRequest
        {
            ConnectionLevel = 6, // invalid
            EnergyLevel = 3,
            CommunicationFeeling = 3
        });
        Assert.False(checkInResult.Succeeded);
        Assert.Equal(ContentServiceStatus.BadRequest, checkInResult.Status);
    }
}
