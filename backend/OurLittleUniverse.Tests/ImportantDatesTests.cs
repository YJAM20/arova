using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using LoveUniverse.Api.Data;
using LoveUniverse.Api.Entities;
using LoveUniverse.Api.Entities.Enums;
using LoveUniverse.Api.Services;
using LoveUniverse.Api.Services.Email;
using LoveUniverse.Api.DTOs.ImportantDates;
using Xunit;

namespace OurLittleUniverse.Tests;

public class ImportantDatesTests
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

    private sealed class MockEmailSender : IEmailSender
    {
        public List<(string ToEmail, string Subject, string PlainText, string Html)> SentEmails { get; } = new();

        public Task SendVerificationCodeAsync(string destination, string code, string purpose, CancellationToken cancellationToken = default)
        {
            return Task.CompletedTask;
        }

        public Task SendEmailAsync(string toEmail, string subject, string plainTextBody, string htmlBody, CancellationToken cancellationToken = default)
        {
            SentEmails.Add((toEmail, subject, plainTextBody, htmlBody));
            return Task.CompletedTask;
        }
    }

    [Fact]
    public async Task User_CanCreate_SharedAndPrivate_ImportantDates()
    {
        // Arrange
        using var context = CreateContext();
        var userId = Guid.NewGuid();
        var coupleId = Guid.NewGuid();
        context.AppUsers.Add(new AppUser { Id = userId, Email = "test@arova.io", Username = "user1", PasswordHash = "hash", CreatedAt = DateTime.UtcNow });
        context.Couples.Add(new Couple { Id = coupleId, Name = "Couple 1", CreatedByUserId = userId, CreatedAt = DateTime.UtcNow });
        await context.SaveChangesAsync();

        var permission = new TestPermissionService { UserId = userId, CoupleId = coupleId, Role = CoupleRole.Owner };
        var sender = new MockEmailSender();
        var logger = LoggerFactory.Create(b => b.AddConsole()).CreateLogger<ImportantDateService>();
        var service = new ImportantDateService(context, permission, sender, logger);

        var sharedRequest = new ImportantDateCreateRequest
        {
            Title = "Our Anniversary",
            Date = DateTime.UtcNow.AddDays(10),
            Type = "anniversary",
            Recurrence = "yearly",
            IsPrivate = false
        };

        var privateRequest = new ImportantDateCreateRequest
        {
            Title = "Partner Gift Prep",
            Date = DateTime.UtcNow.AddDays(5),
            Type = "custom",
            Recurrence = "none",
            IsPrivate = true
        };

        // Act
        var sharedResult = await service.CreateDateAsync(sharedRequest);
        var privateResult = await service.CreateDateAsync(privateRequest);

        // Assert
        Assert.True(sharedResult.Succeeded);
        Assert.Equal("Our Anniversary", sharedResult.Value.Title);
        Assert.False(sharedResult.Value.IsPrivate);

        Assert.True(privateResult.Succeeded);
        Assert.Equal("Partner Gift Prep", privateResult.Value.Title);
        Assert.True(privateResult.Value.IsPrivate);
    }

    [Fact]
    public async Task Partner_CannotView_PrivateImportantDate()
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
        
        var sender = new MockEmailSender();
        var logger = LoggerFactory.Create(b => b.AddConsole()).CreateLogger<ImportantDateService>();
        
        var serviceUser1 = new ImportantDateService(context, permissionUser1, sender, logger);
        var serviceUser2 = new ImportantDateService(context, permissionUser2, sender, logger);

        // User 1 creates private date
        var request = new ImportantDateCreateRequest
        {
            Title = "My Secret Note",
            Date = DateTime.UtcNow.AddDays(3),
            Type = "custom",
            Recurrence = "none",
            IsPrivate = true
        };
        var createResult = await serviceUser1.CreateDateAsync(request);
        var dateId = createResult.Value.Id;

        // Act & Assert
        // User 2 (Partner) tries to fetch dates
        var visibleResult = await serviceUser2.GetVisibleDatesAsync();
        Assert.True(visibleResult.Succeeded);
        Assert.Empty(visibleResult.Value);

        // User 2 tries to fetch the secret date by ID directly
        var getByIdResult = await serviceUser2.GetDateByIdAsync(dateId);
        Assert.False(getByIdResult.Succeeded);
        Assert.Equal(ContentServiceStatus.Forbidden, getByIdResult.Status);
    }

    [Fact]
    public async Task Partner_CanView_SharedImportantDate()
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
        
        var sender = new MockEmailSender();
        var logger = LoggerFactory.Create(b => b.AddConsole()).CreateLogger<ImportantDateService>();
        
        var serviceUser1 = new ImportantDateService(context, permissionUser1, sender, logger);
        var serviceUser2 = new ImportantDateService(context, permissionUser2, sender, logger);

        // User 1 creates shared date
        var request = new ImportantDateCreateRequest
        {
            Title = "Our First Meet",
            Date = DateTime.UtcNow.AddDays(30),
            Type = "first-moment",
            Recurrence = "none",
            IsPrivate = false
        };
        await serviceUser1.CreateDateAsync(request);

        // Act
        var visibleResult = await serviceUser2.GetVisibleDatesAsync();

        // Assert
        Assert.True(visibleResult.Succeeded);
        Assert.Single(visibleResult.Value);
        Assert.Equal("Our First Meet", visibleResult.Value[0].Title);
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
        
        var sender = new MockEmailSender();
        var logger = LoggerFactory.Create(b => b.AddConsole()).CreateLogger<ImportantDateService>();
        
        var serviceUser1 = new ImportantDateService(context, permissionUser1, sender, logger);
        var serviceUser2 = new ImportantDateService(context, permissionUser2, sender, logger);

        // User 1 creates shared date in Couple 1
        var request = new ImportantDateCreateRequest
        {
            Title = "Couple 1 Meetup",
            Date = DateTime.UtcNow.AddDays(5),
            Type = "custom",
            IsPrivate = false
        };
        var createResult = await serviceUser1.CreateDateAsync(request);
        var dateId = createResult.Value.Id;

        // Act & Assert
        // User 2 tries to fetch dates (should get none)
        var listResult = await serviceUser2.GetVisibleDatesAsync();
        Assert.True(listResult.Succeeded);
        Assert.Empty(listResult.Value);

        // User 2 tries to get date by ID directly (should return NotFound/not belong to couple)
        var detailResult = await serviceUser2.GetDateByIdAsync(dateId);
        Assert.False(detailResult.Succeeded);
        Assert.Equal(ContentServiceStatus.NotFound, detailResult.Status);
    }

    [Fact]
    public void YearlyRecurrence_CalculatesNextOccurrenceCorrectly()
    {
        // Arrange
        var today = DateTime.UtcNow.Date;
        
        // Date earlier this year -> next occurrence is next year
        var pastDate = new DateTime(today.Year, 1, 15);
        if (pastDate >= today)
        {
            pastDate = pastDate.AddYears(-1);
        }

        // Act
        var nextYearly = ImportantDateService.CalculateNextOccurrence(pastDate, "yearly");

        // Assert
        Assert.True(nextYearly >= today);
        Assert.Equal(pastDate.Month, nextYearly.Month);
        Assert.Equal(pastDate.Day, nextYearly.Day);
        
        if (pastDate < today)
        {
            Assert.Equal(today.Year + (pastDate.Month < today.Month || (pastDate.Month == today.Month && pastDate.Day < today.Day) ? 1 : 0), nextYearly.Year);
        }
    }

    [Fact]
    public async Task ReminderEmails_ExcludesPrivateDescriptions_AndSendsOnlyToCreatorIfPrivate()
    {
        // Arrange
        using var context = CreateContext();
        var coupleId = Guid.NewGuid();
        var userId1 = Guid.NewGuid();
        var userId2 = Guid.NewGuid();

        // Seed users, couple, and settings
        var u1 = new AppUser { Id = userId1, Email = "creator@arova.io", Username = "creator", PasswordHash = "hash", IsActive = true, CreatedAt = DateTime.UtcNow };
        var u2 = new AppUser { Id = userId2, Email = "partner@arova.io", Username = "partner", PasswordHash = "hash", IsActive = true, CreatedAt = DateTime.UtcNow };
        context.AppUsers.Add(u1);
        context.AppUsers.Add(u2);

        var couple = new Couple { Id = coupleId, Name = "Couple Space", CreatedByUserId = userId1, IsActive = true, CreatedAt = DateTime.UtcNow };
        context.Couples.Add(couple);

        context.CoupleMembers.Add(new CoupleMember { Id = Guid.NewGuid(), CoupleId = coupleId, UserId = userId1, Role = CoupleRole.Owner, IsActive = true, JoinedAt = DateTime.UtcNow, CreatedAt = DateTime.UtcNow });
        context.CoupleMembers.Add(new CoupleMember { Id = Guid.NewGuid(), CoupleId = coupleId, UserId = userId2, Role = CoupleRole.Partner, IsActive = true, JoinedAt = DateTime.UtcNow, CreatedAt = DateTime.UtcNow });

        context.CoupleSettings.Add(new CoupleSettings
        {
            Id = Guid.NewGuid(),
            CoupleId = coupleId,
            EmailNotificationsEnabled = true,
            CreatedAt = DateTime.UtcNow
        });

        // Add a private date that occurs in exactly 3 days (with reminder set to 3 days before)
        var targetDate = DateTime.UtcNow.AddDays(3);
        const string privateDesc = "Buy diamond ring at Kay Jewelers";
        
        var date = new ImportantDate
        {
            Id = Guid.NewGuid(),
            CoupleId = coupleId,
            CreatedByUserId = userId1,
            Title = "Propose to Yaman",
            Description = privateDesc,
            Date = targetDate,
            Type = "custom",
            Recurrence = "none",
            ReminderEnabled = true,
            ReminderDaysBefore = 3,
            IsPrivate = true,
            CreatedAt = DateTime.UtcNow
        };
        context.ImportantDates.Add(date);
        await context.SaveChangesAsync();

        var permission = new TestPermissionService { UserId = userId1, CoupleId = coupleId, Role = CoupleRole.Owner };
        var sender = new MockEmailSender();
        var logger = LoggerFactory.Create(b => b.AddConsole()).CreateLogger<ImportantDateService>();
        var service = new ImportantDateService(context, permission, sender, logger);

        // Act
        var emailSentCount = await service.SendReminderEmailsAsync();

        // Assert
        Assert.Equal(1, emailSentCount);
        Assert.Single(sender.SentEmails);
        
        var email = sender.SentEmails[0];
        Assert.Equal("creator@arova.io", email.ToEmail);
        
        // Private detail check
        Assert.DoesNotContain(privateDesc, email.PlainText);
        Assert.DoesNotContain(privateDesc, email.Html);
    }
}
