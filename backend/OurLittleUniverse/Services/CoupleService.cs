using System.Security.Cryptography;
using LoveUniverse.Api.Data;
using LoveUniverse.Api.DTOs.Couples;
using LoveUniverse.Api.Entities;
using LoveUniverse.Api.Entities.Enums;
using Microsoft.EntityFrameworkCore;

namespace LoveUniverse.Api.Services;

public sealed class CoupleService : ICoupleService
{
    private const int PairingCodeLength = 6;
    private static readonly TimeSpan PairingCodeLifetime = TimeSpan.FromMinutes(30);
    private static readonly char[] PairingCodeCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".ToCharArray();

    private readonly AppDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;
    private readonly IPermissionService _permissionService;

    public CoupleService(
        AppDbContext dbContext,
        ICurrentUserService currentUserService,
        IPermissionService permissionService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
        _permissionService = permissionService;
    }

    public async Task<CoupleServiceResult<CoupleResponse>> CreateCoupleAsync(
        CreateCoupleRequest request,
        CancellationToken cancellationToken = default)
    {
        var userId = _currentUserService.UserId;
        if (userId is null)
        {
            return CoupleServiceResult<CoupleResponse>.Failure(CoupleServiceStatus.Unauthorized, "Please sign in to continue.");
        }

        var name = request.Name.Trim();
        if (string.IsNullOrWhiteSpace(name))
        {
            return CoupleServiceResult<CoupleResponse>.Failure(CoupleServiceStatus.BadRequest, "Couple name is required.");
        }

        if (await HasActiveCoupleAsync(userId.Value, cancellationToken))
        {
            return CoupleServiceResult<CoupleResponse>.Failure(
                CoupleServiceStatus.BadRequest,
                "You already belong to an active couple space.");
        }

        var now = DateTime.UtcNow;
        var couple = new Couple
        {
            Id = Guid.NewGuid(),
            Name = name,
            CreatedByUserId = userId.Value,
            IsActive = true,
            CreatedAt = now
        };

        var ownerMember = new CoupleMember
        {
            Id = Guid.NewGuid(),
            CoupleId = couple.Id,
            UserId = userId.Value,
            Role = CoupleRole.Owner,
            IsActive = true,
            JoinedAt = now,
            CreatedAt = now
        };

        var settings = new CoupleSettings
        {
            Id = Guid.NewGuid(),
            CoupleId = couple.Id,
            TimeZone = "UTC",
            DailyReasonsEnabled = true,
            MoodTrackingEnabled = true,
            PrivateByDefault = false,
            ActiveTheme = "default",
            LanguageMode = "en",
            AnimationsEnabled = true,
            MusicEnabled = true,
            CreatedAt = now
        };

        var subscription = new CoupleSubscription
        {
            Id = Guid.NewGuid(),
            CoupleId = couple.Id,
            PlanType = SubscriptionPlanType.Free,
            Status = "Active",
            IsGifted = false,
            StartedAt = now,
            CreatedAt = now
        };

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);
        _dbContext.Couples.Add(couple);
        _dbContext.CoupleMembers.Add(ownerMember);
        _dbContext.CoupleSettings.Add(settings);
        _dbContext.CoupleSubscriptions.Add(subscription);
        await _dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        var response = await BuildCoupleResponseAsync(couple.Id, userId.Value, cancellationToken);
        return CoupleServiceResult<CoupleResponse>.Success(response!);
    }

    public async Task<CoupleServiceResult<CoupleResponse>> GetMyCoupleAsync(CancellationToken cancellationToken = default)
    {
        var userId = _currentUserService.UserId;
        if (userId is null)
        {
            return CoupleServiceResult<CoupleResponse>.Failure(CoupleServiceStatus.Unauthorized, "Please sign in to continue.");
        }

        var coupleId = await _permissionService.GetCurrentUserCoupleIdAsync(cancellationToken);
        if (coupleId is null)
        {
            return CoupleServiceResult<CoupleResponse>.Failure(CoupleServiceStatus.NotFound, "You are not in a couple space yet.");
        }

        var response = await BuildCoupleResponseAsync(coupleId.Value, userId.Value, cancellationToken);
        return response is null
            ? CoupleServiceResult<CoupleResponse>.Failure(CoupleServiceStatus.NotFound, "You are not in a couple space yet.")
            : CoupleServiceResult<CoupleResponse>.Success(response);
    }

    public async Task<CoupleServiceResult<PairingCodeResponse>> GeneratePairingCodeAsync(
        CancellationToken cancellationToken = default)
    {
        var userId = _currentUserService.UserId;
        if (userId is null)
        {
            return CoupleServiceResult<PairingCodeResponse>.Failure(CoupleServiceStatus.Unauthorized, "Please sign in to continue.");
        }

        var membership = await GetCurrentActiveMembershipAsync(userId.Value, cancellationToken);
        if (membership is null)
        {
            return CoupleServiceResult<PairingCodeResponse>.Failure(
                CoupleServiceStatus.NotFound,
                "Create or join a couple space first.");
        }

        if (membership.Role != CoupleRole.Owner)
        {
            return CoupleServiceResult<PairingCodeResponse>.Failure(
                CoupleServiceStatus.Forbidden,
                "Only the owner can generate a pairing code.");
        }

        var code = await GenerateUniquePairingCodeAsync(cancellationToken);
        if (code is null)
        {
            return CoupleServiceResult<PairingCodeResponse>.Failure(
                CoupleServiceStatus.BadRequest,
                "Could not generate a pairing code right now. Please try again.");
        }

        var now = DateTime.UtcNow;
        var expiresAt = now.Add(PairingCodeLifetime);
        var pairingCode = new PairingCode
        {
            Id = Guid.NewGuid(),
            CoupleId = membership.CoupleId,
            CreatedByUserId = userId.Value,
            Code = code,
            ExpiresAt = expiresAt,
            IsRevoked = false,
            CreatedAt = now
        };

        _dbContext.PairingCodes.Add(pairingCode);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return CoupleServiceResult<PairingCodeResponse>.Success(new PairingCodeResponse
        {
            Code = pairingCode.Code,
            ExpiresAtUtc = pairingCode.ExpiresAt
        });
    }

    public async Task<CoupleServiceResult<CoupleResponse>> JoinCoupleAsync(
        JoinCoupleRequest request,
        CancellationToken cancellationToken = default)
    {
        var userId = _currentUserService.UserId;
        if (userId is null)
        {
            return CoupleServiceResult<CoupleResponse>.Failure(CoupleServiceStatus.Unauthorized, "Please sign in to continue.");
        }

        if (await HasActiveCoupleAsync(userId.Value, cancellationToken))
        {
            return CoupleServiceResult<CoupleResponse>.Failure(
                CoupleServiceStatus.BadRequest,
                "You already belong to an active couple space.");
        }

        var code = request.Code.Trim().ToUpperInvariant();
        var pairingCode = await _dbContext.PairingCodes
            .Include(candidate => candidate.Couple)
            .FirstOrDefaultAsync(candidate => candidate.Code == code, cancellationToken);

        if (pairingCode is null)
        {
            return CoupleServiceResult<CoupleResponse>.Failure(CoupleServiceStatus.NotFound, "Pairing code was not found.");
        }

        var now = DateTime.UtcNow;
        if (pairingCode.IsRevoked || pairingCode.UsedAt is not null || pairingCode.UsedByUserId is not null)
        {
            return CoupleServiceResult<CoupleResponse>.Failure(CoupleServiceStatus.BadRequest, "This pairing code has already been used.");
        }

        if (pairingCode.ExpiresAt <= now)
        {
            return CoupleServiceResult<CoupleResponse>.Failure(CoupleServiceStatus.BadRequest, "This pairing code has expired.");
        }

        if (!pairingCode.Couple.IsActive)
        {
            return CoupleServiceResult<CoupleResponse>.Failure(CoupleServiceStatus.BadRequest, "This couple space is no longer active.");
        }

        var member = new CoupleMember
        {
            Id = Guid.NewGuid(),
            CoupleId = pairingCode.CoupleId,
            UserId = userId.Value,
            Role = CoupleRole.Partner,
            IsActive = true,
            JoinedAt = now,
            CreatedAt = now
        };

        pairingCode.UsedByUserId = userId.Value;
        pairingCode.UsedAt = now;
        pairingCode.UpdatedAt = now;

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);
        _dbContext.CoupleMembers.Add(member);
        await _dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        var response = await BuildCoupleResponseAsync(pairingCode.CoupleId, userId.Value, cancellationToken);
        return CoupleServiceResult<CoupleResponse>.Success(response!);
    }

    public async Task<CoupleServiceResult<IReadOnlyList<CoupleMemberResponse>>> GetMembersAsync(
        CancellationToken cancellationToken = default)
    {
        var userId = _currentUserService.UserId;
        if (userId is null)
        {
            return CoupleServiceResult<IReadOnlyList<CoupleMemberResponse>>.Failure(
                CoupleServiceStatus.Unauthorized,
                "Please sign in to continue.");
        }

        var coupleId = await _permissionService.GetCurrentUserCoupleIdAsync(cancellationToken);
        if (coupleId is null)
        {
            return CoupleServiceResult<IReadOnlyList<CoupleMemberResponse>>.Failure(
                CoupleServiceStatus.NotFound,
                "Create or join a couple space first.");
        }

        var members = await _dbContext.CoupleMembers
            .AsNoTracking()
            .Where(member => member.CoupleId == coupleId.Value && member.IsActive && member.Couple.IsActive)
            .OrderBy(member => member.JoinedAt)
            .Select(member => new CoupleMemberResponse
            {
                UserId = member.UserId,
                DisplayName = member.User.DisplayName ?? member.User.Username,
                Username = member.User.Username,
                AvatarUrl = member.User.AvatarUrl,
                Role = member.Role.ToString(),
                JoinedAt = member.JoinedAt
            })
            .ToListAsync(cancellationToken);

        return CoupleServiceResult<IReadOnlyList<CoupleMemberResponse>>.Success(members);
    }

    private async Task<bool> HasActiveCoupleAsync(Guid userId, CancellationToken cancellationToken)
    {
        return await _dbContext.CoupleMembers
            .AsNoTracking()
            .AnyAsync(
                member => member.UserId == userId && member.IsActive && member.Couple.IsActive,
                cancellationToken);
    }

    private async Task<CoupleMember?> GetCurrentActiveMembershipAsync(Guid userId, CancellationToken cancellationToken)
    {
        return await _dbContext.CoupleMembers
            .AsNoTracking()
            .Include(member => member.Couple)
            .FirstOrDefaultAsync(
                member => member.UserId == userId && member.IsActive && member.Couple.IsActive,
                cancellationToken);
    }

    private async Task<CoupleResponse?> BuildCoupleResponseAsync(
        Guid coupleId,
        Guid userId,
        CancellationToken cancellationToken)
    {
        return await _dbContext.Couples
            .AsNoTracking()
            .Where(couple => couple.Id == coupleId && couple.IsActive)
            .Select(couple => new CoupleResponse
            {
                Id = couple.Id,
                Name = couple.Name,
                CreatedByUserId = couple.CreatedByUserId,
                CurrentUserRole = couple.Members
                    .Where(member => member.UserId == userId && member.IsActive)
                    .Select(member => member.Role.ToString())
                    .FirstOrDefault() ?? string.Empty,
                MemberCount = couple.Members.Count(member => member.IsActive),
                CreatedAt = couple.CreatedAt
            })
            .FirstOrDefaultAsync(cancellationToken);
    }

    private async Task<string?> GenerateUniquePairingCodeAsync(CancellationToken cancellationToken)
    {
        for (var attempt = 0; attempt < 10; attempt++)
        {
            var code = GeneratePairingCode();
            var exists = await _dbContext.PairingCodes
                .AsNoTracking()
                .AnyAsync(pairingCode => pairingCode.Code == code, cancellationToken);

            if (!exists)
            {
                return code;
            }
        }

        return null;
    }

    private static string GeneratePairingCode()
    {
        Span<char> code = stackalloc char[PairingCodeLength];
        for (var i = 0; i < code.Length; i++)
        {
            var index = RandomNumberGenerator.GetInt32(PairingCodeCharacters.Length);
            code[i] = PairingCodeCharacters[index];
        }

        return new string(code);
    }
}
