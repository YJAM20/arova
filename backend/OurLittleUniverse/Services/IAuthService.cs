using LoveUniverse.Api.DTOs.Auth;

namespace LoveUniverse.Api.Services;

public interface IAuthService
{
    Task<AuthServiceResult> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);

    Task<AuthServiceResult> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);

    Task<UserResponse?> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken = default);
}

public sealed record AuthServiceResult(
    bool Succeeded,
    AuthResponse? Response,
    string? ErrorMessage)
{
    public static AuthServiceResult Success(AuthResponse response)
    {
        return new AuthServiceResult(true, response, null);
    }

    public static AuthServiceResult Failure(string errorMessage)
    {
        return new AuthServiceResult(false, null, errorMessage);
    }
}
