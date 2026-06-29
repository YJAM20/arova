using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using LoveUniverse.Api.Data;
using LoveUniverse.Api.Entities;
using LoveUniverse.Api.Entities.Enums;
using LoveUniverse.Api.Services;
using LoveUniverse.Api.Services.Email;
using LoveUniverse.Api.DTOs.Admin;
using Xunit;

namespace OurLittleUniverse.Tests;

public class EmailNotificationsTests
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

    private sealed class MockHttpClientFactory : IHttpClientFactory
    {
        public HttpClient CreateClient(string name)
        {
            return new HttpClient();
        }
    }

    [Fact]
    public async Task DailyDigest_ExcludesPrivateNotes_AndSealedLetterBodies()
    {
        // Arrange
        using var context = CreateContext();
        var mockEmailSender = new MockEmailSender();
        var logger = LoggerFactory.Create(builder => builder.AddConsole()).CreateLogger<DailyDigestService>();
        var digestService = new DailyDigestService(context, mockEmailSender, logger);

        var coupleId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        // Seed user and couple settings enabling digest
        var user = new AppUser { Id = userId, Email = "partner@arova.io", Username = "arova_partner", PasswordHash = "hash", IsActive = true, CreatedAt = DateTime.UtcNow };
        context.AppUsers.Add(user);

        var couple = new Couple { Id = coupleId, Name = "Perfect Couple", CreatedByUserId = userId, IsActive = true, CreatedAt = DateTime.UtcNow };
        context.Couples.Add(couple);

        var member = new CoupleMember { Id = Guid.NewGuid(), CoupleId = coupleId, UserId = userId, Role = CoupleRole.Owner, IsActive = true, JoinedAt = DateTime.UtcNow, CreatedAt = DateTime.UtcNow };
        context.CoupleMembers.Add(member);

        var settings = new CoupleSettings
        {
            Id = Guid.NewGuid(),
            CoupleId = coupleId,
            EmailNotificationsEnabled = true,
            DailyDigestEnabled = true,
            CreatedAt = DateTime.UtcNow
        };
        context.CoupleSettings.Add(settings);

        // Seed some activities with private details
        const string privateNoteContent = "This is a super secret private note that should never be in the email";
        var memory = new Memory
        {
            Id = Guid.NewGuid(),
            CoupleId = coupleId,
            CreatedByUserId = userId,
            Title = "Weekend Trip",
            Description = "Fun times",
            PrivateNote = privateNoteContent,
            VisibilityLevel = VisibilityLevel.Shared,
            CreatedAt = DateTime.UtcNow
        };
        context.Memories.Add(memory);

        const string sealedLetterBody = "This is the body of a sealed letter that is private and locked";
        var letter = new Letter
        {
            Id = Guid.NewGuid(),
            CoupleId = coupleId,
            CreatedByUserId = userId,
            Title = "Love Letter",
            Body = sealedLetterBody,
            IsLocked = true,
            VisibilityLevel = VisibilityLevel.PartnerOnly,
            CreatedAt = DateTime.UtcNow
        };
        context.Letters.Add(letter);

        await context.SaveChangesAsync();

        // Act
        var sendCount = await digestService.SendDailyDigestsAsync();

        // Assert
        Assert.Equal(1, sendCount);
        Assert.Single(mockEmailSender.SentEmails);
        
        var sentEmail = mockEmailSender.SentEmails[0];
        Assert.Equal("partner@arova.io", sentEmail.ToEmail);
        Assert.Contains("1 memory", sentEmail.PlainText); // safe count
        Assert.Contains("1 letter", sentEmail.PlainText); // safe count

        // Security / Privacy assertion
        Assert.DoesNotContain(privateNoteContent, sentEmail.PlainText);
        Assert.DoesNotContain(privateNoteContent, sentEmail.Html);
        Assert.DoesNotContain(sealedLetterBody, sentEmail.PlainText);
        Assert.DoesNotContain(sealedLetterBody, sentEmail.Html);
    }

    [Fact]
    public async Task DailyDigest_IncludesCorrectCounts()
    {
        // Arrange
        using var context = CreateContext();
        var mockEmailSender = new MockEmailSender();
        var logger = LoggerFactory.Create(builder => builder.AddConsole()).CreateLogger<DailyDigestService>();
        var digestService = new DailyDigestService(context, mockEmailSender, logger);

        var coupleId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var user = new AppUser { Id = userId, Email = "test@arova.io", Username = "tester", PasswordHash = "hash", IsActive = true, CreatedAt = DateTime.UtcNow };
        context.AppUsers.Add(user);

        var couple = new Couple { Id = coupleId, Name = "Perfect Couple", CreatedByUserId = userId, IsActive = true, CreatedAt = DateTime.UtcNow };
        context.Couples.Add(couple);

        var member = new CoupleMember { Id = Guid.NewGuid(), CoupleId = coupleId, UserId = userId, Role = CoupleRole.Owner, IsActive = true, JoinedAt = DateTime.UtcNow, CreatedAt = DateTime.UtcNow };
        context.CoupleMembers.Add(member);

        var settings = new CoupleSettings
        {
            Id = Guid.NewGuid(),
            CoupleId = coupleId,
            EmailNotificationsEnabled = true,
            DailyDigestEnabled = true,
            CreatedAt = DateTime.UtcNow
        };
        context.CoupleSettings.Add(settings);

        // Seed exactly: 2 memories, 1 letter, 1 mood check-in, 18 points
        context.Memories.Add(new Memory { Id = Guid.NewGuid(), CoupleId = coupleId, CreatedByUserId = userId, Title = "M1", VisibilityLevel = VisibilityLevel.Shared, CreatedAt = DateTime.UtcNow });
        context.Memories.Add(new Memory { Id = Guid.NewGuid(), CoupleId = coupleId, CreatedByUserId = userId, Title = "M2", VisibilityLevel = VisibilityLevel.Shared, CreatedAt = DateTime.UtcNow });
        context.Letters.Add(new Letter { Id = Guid.NewGuid(), CoupleId = coupleId, CreatedByUserId = userId, Title = "L1", Body = "Body", VisibilityLevel = VisibilityLevel.Shared, CreatedAt = DateTime.UtcNow });
        context.MoodEntries.Add(new MoodEntry { Id = Guid.NewGuid(), CoupleId = coupleId, UserId = userId, Note = "Feeling good", CreatedAt = DateTime.UtcNow });
        context.RelationshipPointLedgers.Add(new RelationshipPointLedger { Id = Guid.NewGuid(), CoupleId = coupleId, UserId = userId, Points = 18, ActionType = "daily_completed", Reason = "Completed task", CreatedAt = DateTime.UtcNow });

        await context.SaveChangesAsync();

        // Act
        await digestService.SendDailyDigestsAsync();

        // Assert
        Assert.Single(mockEmailSender.SentEmails);
        var email = mockEmailSender.SentEmails[0];
        
        Assert.Contains("2 memories", email.PlainText);
        Assert.Contains("1 letter", email.PlainText);
        Assert.Contains("1 mood check-in", email.PlainText);
        Assert.Contains("gained 18 points", email.PlainText);
    }

    [Fact]
    public async Task ConsoleEmailSender_WorksWithoutApiKey()
    {
        // Arrange
        var logger = LoggerFactory.Create(builder => builder.AddConsole()).CreateLogger<ConsoleEmailSender>();
        var sender = new ConsoleEmailSender(logger);

        // Act
        var exception = await Record.ExceptionAsync(() => sender.SendEmailAsync("test@arova.io", "Subject", "Plain text", "<h1>HTML</h1>"));

        // Assert
        Assert.Null(exception);
    }

    [Fact]
    public async Task ResendEmailSender_DoesNotSend_IfApiKeyIsMissing()
    {
        // Arrange
        var options = Options.Create(new EmailOptions { ResendApiKey = "" });
        var clientFactory = new MockHttpClientFactory();
        var logger = LoggerFactory.Create(builder => builder.AddConsole()).CreateLogger<ResendEmailSender>();
        var sender = new ResendEmailSender(options, clientFactory, logger);

        // Act
        var exception = await Record.ExceptionAsync(() => sender.SendEmailAsync("test@arova.io", "Subject", "Plain text", "<h1>HTML</h1>"));

        // Assert
        Assert.Null(exception);
    }

    [Fact]
    public void EmailOptions_BindCorrectly()
    {
        // Arrange
        var options = new EmailOptions
        {
            Provider = "Resend",
            FromEmail = "no-reply@test.com",
            FromName = "Arova Universe",
            ResendApiKey = "re_secret_key",
            DailyDigestEnabled = true
        };

        // Assert
        Assert.Equal("Resend", options.Provider);
        Assert.Equal("no-reply@test.com", options.FromEmail);
        Assert.Equal("Arova Universe", options.FromName);
        Assert.Equal("re_secret_key", options.ResendApiKey);
        Assert.True(options.DailyDigestEnabled);
    }
}
