using System.Security.Cryptography;
using LoveUniverse.Api.Auth;
using LoveUniverse.Api.Data;
using LoveUniverse.Api.DTOs.Auth;
using LoveUniverse.Api.Entities;
using LoveUniverse.Api.Entities.Enums;
using Microsoft.EntityFrameworkCore;

namespace LoveUniverse.Api.Services;

public sealed class AccountVerificationService : IAccountVerificationService
{
    private const int CodeLength = 6;
    private const int MaxAttempts = 5;
    private static readonly TimeSpan CodeLifetime = TimeSpan.FromMinutes(10);

    private readonly AppDbContext _dbContext;
    private readonly IPasswordHasherService _passwordHasher;
    private readonly IEmailSender _emailSender;
    private readonly ISmsSender _smsSender;

    public AccountVerificationService(
        AppDbContext dbContext,
        IPasswordHasherService passwordHasher,
        IEmailSender emailSender,
        ISmsSender smsSender)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
        _emailSender = emailSender;
        _smsSender = smsSender;
    }

    public async Task<ContentServiceResult<VerificationResponse>> RequestCodeAsync(
        VerificationCodeRequest request,
        CancellationToken cancellationToken = default)
    {
        if (!TryParseChannel(request.Channel, out var channel)
            || !TryParsePurpose(request.Purpose, out var purpose))
        {
            return ContentServiceResult<VerificationResponse>.Failure(ContentServiceStatus.BadRequest, "Verification request is invalid.");
        }

        var destination = NormalizeDestination(channel, request.Destination);
        if (string.IsNullOrWhiteSpace(destination))
        {
            return ContentServiceResult<VerificationResponse>.Failure(ContentServiceStatus.BadRequest, "Verification destination is required.");
        }

        if (channel == VerificationChannel.Phone)
        {
            var smsResult = await _smsSender.SendVerificationCodeAsync(destination, string.Empty, purpose.ToString(), cancellationToken);
            return ContentServiceResult<VerificationResponse>.Success(new VerificationResponse
            {
                Succeeded = false,
                Message = smsResult.Message
            });
        }

        var user = await _dbContext.AppUsers
            .FirstOrDefaultAsync(candidate => candidate.Email == destination && candidate.IsActive, cancellationToken);

        var code = GenerateCode();
        var now = DateTime.UtcNow;
        _dbContext.AccountVerificationCodes.Add(new AccountVerificationCode
        {
            Id = Guid.NewGuid(),
            UserId = user?.Id,
            Channel = channel,
            Destination = destination,
            CodeHash = _passwordHasher.HashPassword(code),
            Purpose = purpose,
            ExpiresAt = now.Add(CodeLifetime),
            Attempts = 0,
            CreatedAt = now
        });

        await _dbContext.SaveChangesAsync(cancellationToken);
        await _emailSender.SendVerificationCodeAsync(destination, code, purpose.ToString(), cancellationToken);

        return ContentServiceResult<VerificationResponse>.Success(new VerificationResponse
        {
            Succeeded = true,
            Message = "If the destination can receive verification codes, a code has been sent."
        });
    }

    public async Task<ContentServiceResult<VerificationResponse>> VerifyCodeAsync(
        VerifyCodeRequest request,
        CancellationToken cancellationToken = default)
    {
        if (!TryParseChannel(request.Channel, out var channel)
            || !TryParsePurpose(request.Purpose, out var purpose))
        {
            return ContentServiceResult<VerificationResponse>.Failure(ContentServiceStatus.BadRequest, "Verification request is invalid.");
        }

        if (channel == VerificationChannel.Phone)
        {
            return ContentServiceResult<VerificationResponse>.Success(new VerificationResponse
            {
                Succeeded = false,
                Message = "Phone verification is not available in this environment yet. Please use email verification for now."
            });
        }

        var destination = NormalizeDestination(channel, request.Destination);
        var now = DateTime.UtcNow;
        var candidates = await _dbContext.AccountVerificationCodes
            .Include(code => code.User)
            .Where(code => code.Channel == channel
                && code.Purpose == purpose
                && code.Destination == destination
                && code.UsedAt == null
                && code.ExpiresAt > now)
            .OrderByDescending(code => code.CreatedAt)
            .Take(5)
            .ToListAsync(cancellationToken);

        foreach (var candidate in candidates)
        {
            if (candidate.Attempts >= MaxAttempts)
            {
                continue;
            }

            candidate.Attempts++;
            if (!_passwordHasher.VerifyPassword(request.Code.Trim(), candidate.CodeHash))
            {
                continue;
            }

            candidate.UsedAt = now;
            if (candidate.User is not null)
            {
                candidate.User.EmailVerifiedAt = now;
                candidate.User.IsVerified = true;
                candidate.User.UpdatedAt = now;
            }

            await _dbContext.SaveChangesAsync(cancellationToken);
            return ContentServiceResult<VerificationResponse>.Success(new VerificationResponse
            {
                Succeeded = true,
                Message = "Verification completed."
            });
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        return ContentServiceResult<VerificationResponse>.Failure(ContentServiceStatus.BadRequest, "The code is invalid or expired.");
    }

    private static bool TryParseChannel(string value, out VerificationChannel channel)
    {
        return Enum.TryParse(value, ignoreCase: true, out channel);
    }

    private static bool TryParsePurpose(string value, out VerificationPurpose purpose)
    {
        return Enum.TryParse(value, ignoreCase: true, out purpose);
    }

    private static string NormalizeDestination(VerificationChannel channel, string destination)
    {
        var value = destination.Trim();
        return channel == VerificationChannel.Email ? value.ToLowerInvariant() : value;
    }

    private static string GenerateCode()
    {
        var code = RandomNumberGenerator.GetInt32(0, 1_000_000);
        return code.ToString("D6");
    }
}
