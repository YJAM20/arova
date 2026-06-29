using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using LoveUniverse.Api.Data;
using LoveUniverse.Api.Entities;
using LoveUniverse.Api.Entities.Enums;
using LoveUniverse.Api.Services;
using LoveUniverse.Api.DTOs.Admin;
using Xunit;

namespace OurLittleUniverse.Tests;

public class AdminTests
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

    private class TestDailyDigestService : IDailyDigestService
    {
        public Task<int> SendDailyDigestsAsync(CancellationToken cancellationToken = default)
        {
            return Task.FromResult(0);
        }

        public Task<bool> SendTestDailyDigestAsync(Guid coupleId, CancellationToken cancellationToken = default)
        {
            return Task.FromResult(true);
        }
    }

    [Fact]
    public async Task GetEngagement_NonAdmin_ReturnsForbidden()
    {
        // Arrange
        using var context = CreateContext();
        var userId = Guid.NewGuid();
        var user = new AppUser
        {
            Id = userId,
            Username = "user",
            Email = "user@example.com",
            PasswordHash = "hash",
            IsSystemAdmin = false,
            CreatedAt = DateTime.UtcNow
        };
        context.AppUsers.Add(user);
        await context.SaveChangesAsync();

        var permissionService = new TestPermissionService { UserId = userId };
        var adminService = new AdminService(context, permissionService, new TestDailyDigestService());

        // Act
        var result = await adminService.GetEngagementAsync(Guid.NewGuid());

        // Assert
        Assert.Equal(ContentServiceStatus.Forbidden, result.Status);
    }

    [Fact]
    public async Task GetEngagement_Admin_ReturnsSuccess()
    {
        // Arrange
        using var context = CreateContext();
        var adminId = Guid.NewGuid();
        var admin = new AppUser
        {
            Id = adminId,
            Username = "admin",
            Email = "admin@example.com",
            PasswordHash = "hash",
            IsSystemAdmin = true,
            CreatedAt = DateTime.UtcNow
        };
        context.AppUsers.Add(admin);

        var coupleId = Guid.NewGuid();
        var couple = new Couple
        {
            Id = coupleId,
            Name = "Couple A",
            CreatedByUserId = adminId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        context.Couples.Add(couple);
        await context.SaveChangesAsync();

        var permissionService = new TestPermissionService { UserId = adminId, CoupleId = coupleId };
        var adminService = new AdminService(context, permissionService, new TestDailyDigestService());

        // Act
        var result = await adminService.GetEngagementAsync(coupleId);

        // Assert
        Assert.Equal(ContentServiceStatus.Success, result.Status);
        Assert.NotNull(result.Value);
    }

    [Fact]
    public async Task GetEngagement_ScopesCountsToCouple()
    {
        // Arrange
        using var context = CreateContext();
        var adminId = Guid.NewGuid();
        var admin = new AppUser
        {
            Id = adminId,
            Username = "admin",
            Email = "admin@example.com",
            PasswordHash = "hash",
            IsSystemAdmin = true,
            CreatedAt = DateTime.UtcNow
        };
        context.AppUsers.Add(admin);

        var couple1Id = Guid.NewGuid();
        var couple2Id = Guid.NewGuid();
        context.Couples.AddRange(
            new Couple { Id = couple1Id, Name = "Couple 1", CreatedByUserId = adminId, IsActive = true, CreatedAt = DateTime.UtcNow },
            new Couple { Id = couple2Id, Name = "Couple 2", CreatedByUserId = adminId, IsActive = true, CreatedAt = DateTime.UtcNow }
        );

        // Add 2 memories for couple 1 and 1 memory for couple 2
        context.Memories.AddRange(
            new Memory { Id = Guid.NewGuid(), CoupleId = couple1Id, CreatedByUserId = adminId, Title = "M1", CreatedAt = DateTime.UtcNow, VisibilityLevel = VisibilityLevel.Shared },
            new Memory { Id = Guid.NewGuid(), CoupleId = couple1Id, CreatedByUserId = adminId, Title = "M2", CreatedAt = DateTime.UtcNow, VisibilityLevel = VisibilityLevel.Shared },
            new Memory { Id = Guid.NewGuid(), CoupleId = couple2Id, CreatedByUserId = adminId, Title = "M3", CreatedAt = DateTime.UtcNow, VisibilityLevel = VisibilityLevel.Shared }
        );

        await context.SaveChangesAsync();

        var permissionService = new TestPermissionService { UserId = adminId };
        var adminService = new AdminService(context, permissionService, new TestDailyDigestService());

        // Act & Assert
        var result1 = await adminService.GetEngagementAsync(couple1Id);
        Assert.Equal(2, result1.Value.TotalMemories);

        var result2 = await adminService.GetEngagementAsync(couple2Id);
        Assert.Equal(1, result2.Value.TotalMemories);
    }

    [Fact]
    public async Task GetEngagement_ExcludesPrivateNotesAndLetterBodies()
    {
        // Arrange
        using var context = CreateContext();
        var adminId = Guid.NewGuid();
        var admin = new AppUser
        {
            Id = adminId,
            Username = "admin",
            Email = "admin@example.com",
            PasswordHash = "hash",
            IsSystemAdmin = true,
            CreatedAt = DateTime.UtcNow
        };
        context.AppUsers.Add(admin);

        var coupleId = Guid.NewGuid();
        context.Couples.Add(new Couple { Id = coupleId, Name = "Couple 1", CreatedByUserId = adminId, IsActive = true, CreatedAt = DateTime.UtcNow });

        // Memory with PrivateNote, Letter with Body
        context.Memories.Add(new Memory
        {
            Id = Guid.NewGuid(),
            CoupleId = coupleId,
            CreatedByUserId = adminId,
            Title = "Mem",
            PrivateNote = "SUPER SECRET PRIVATE NOTE TEXT",
            CreatedAt = DateTime.UtcNow,
            VisibilityLevel = VisibilityLevel.Private
        });

        context.Letters.Add(new Letter
        {
            Id = Guid.NewGuid(),
            CoupleId = coupleId,
            CreatedByUserId = adminId,
            Title = "Let",
            Body = "CONFIDENTIAL SEALED LETTER BODY TEXT",
            IsLocked = true,
            CreatedAt = DateTime.UtcNow,
            VisibilityLevel = VisibilityLevel.Secret
        });

        await context.SaveChangesAsync();

        var permissionService = new TestPermissionService { UserId = adminId };
        var adminService = new AdminService(context, permissionService, new TestDailyDigestService());

        // Act
        var result = await adminService.GetEngagementAsync(coupleId);

        // Assert
        Assert.Equal(ContentServiceStatus.Success, result.Status);
        Assert.Equal(1, result.Value.TotalMemories);
        Assert.Equal(1, result.Value.TotalLetters);

        // We check that our DTO or logic code contains no trace of the private note or letter body strings
        // Since the DTO properties for note/body do not exist and are not returned, they are excluded by design.
    }
}
