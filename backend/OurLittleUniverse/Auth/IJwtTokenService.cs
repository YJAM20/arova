using LoveUniverse.Api.Entities;

namespace LoveUniverse.Api.Auth;

public interface IJwtTokenService
{
    string GenerateToken(AppUser user, out DateTime expiresAtUtc);
}
