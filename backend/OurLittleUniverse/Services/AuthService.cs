using LoveUniverse.Api.Auth;
using LoveUniverse.Api.Data;
using LoveUniverse.Api.DTOs.Auth;
using LoveUniverse.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace LoveUniverse.Api.Services;

public sealed class AuthService : IAuthService
{
    private readonly AppDbContext _dbContext;
    private readonly IPasswordHasherService _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IPasswordStrengthService _passwordStrengthService;
    private readonly ISetupStatusService _setupStatusService;

    public AuthService(
        AppDbContext dbContext,
        IPasswordHasherService passwordHasher,
        IJwtTokenService jwtTokenService,
        IPasswordStrengthService passwordStrengthService,
        ISetupStatusService setupStatusService)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
        _passwordStrengthService = passwordStrengthService;
        _setupStatusService = setupStatusService;
    }

    public async Task<AuthServiceResult> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        var email = NormalizeEmail(request.Email);
        var username = request.Username.Trim();
        var normalizedUsername = NormalizeUsername(username);

        var passwordValidation = _passwordStrengthService.ValidateForRegistration(request.Password);
        if (!passwordValidation.Succeeded)
        {
            return AuthServiceResult.Failure(passwordValidation.ErrorMessage ?? "Please choose a stronger password or passphrase.");
        }

        if (await _dbContext.AppUsers.AnyAsync(user => user.Email.ToLower() == email, cancellationToken))
        {
            return AuthServiceResult.Failure("An account with this email already exists.");
        }

        if (await _dbContext.AppUsers.AnyAsync(user => user.Username.ToLower() == normalizedUsername, cancellationToken))
        {
            return AuthServiceResult.Failure("An account with this username already exists.");
        }

        var now = DateTime.UtcNow;
        var user = new AppUser
        {
            Id = Guid.NewGuid(),
            DisplayName = request.DisplayName.Trim(),
            Username = username,
            Email = email,
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            IsActive = true,
            CreatedAt = now
        };

        _dbContext.AppUsers.Add(user);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return AuthServiceResult.Success(await CreateAuthResponseAsync(user, cancellationToken));
    }

    public async Task<AuthServiceResult> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var usernameOrEmail = request.UsernameOrEmail.Trim().ToLowerInvariant();
        var user = await _dbContext.AppUsers
            .FirstOrDefaultAsync(
                candidate => candidate.Email.ToLower() == usernameOrEmail
                    || candidate.Username.ToLower() == usernameOrEmail,
                cancellationToken);

        if (user is null || !user.IsActive || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            return AuthServiceResult.Failure("Username/email or password is incorrect.");
        }

        user.LastLoginAt = DateTime.UtcNow;
        user.UpdatedAt = user.LastLoginAt;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return AuthServiceResult.Success(await CreateAuthResponseAsync(user, cancellationToken));
    }

    public async Task<UserResponse?> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.AppUsers
            .AsNoTracking()
            .FirstOrDefaultAsync(candidate => candidate.Id == userId && candidate.IsActive, cancellationToken);

        return user is null ? null : CreateUserResponse(user);
    }

    private async Task<AuthResponse> CreateAuthResponseAsync(AppUser user, CancellationToken cancellationToken)
    {
        var token = _jwtTokenService.GenerateToken(user, out var expiresAtUtc);
        var setup = await _setupStatusService.GetSetupStatusAsync(user.Id, cancellationToken);
        return new AuthResponse
        {
            Token = token,
            ExpiresAtUtc = expiresAtUtc,
            User = CreateUserResponse(user),
            IsVerified = setup.IsVerified,
            HasCompletedQuickOnboarding = setup.HasCompletedQuickOnboarding,
            HasCompletedProfile = setup.HasCompletedProfile,
            HasCouple = setup.HasCouple,
            PreferredLanguage = setup.PreferredLanguage,
            CanEnableMatureMode = setup.CanEnableMatureMode,
            MatureContentEnabled = setup.MatureContentEnabled
        };
    }

    private static UserResponse CreateUserResponse(AppUser user)
    {
        return new UserResponse
        {
            Id = user.Id,
            DisplayName = user.DisplayName ?? user.Username,
            Username = user.Username,
            Email = user.Email,
            AvatarUrl = user.AvatarUrl,
            IsVerified = user.IsVerified,
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt,
            IsSystemAdmin = user.IsSystemAdmin,
            Role = user.IsSystemAdmin ? "admin" : "partner"
        };
    }

    private static string NormalizeEmail(string email)
    {
        return email.Trim().ToLowerInvariant();
    }

    private static string NormalizeUsername(string username)
    {
        return username.Trim().ToLowerInvariant();
    }
}
