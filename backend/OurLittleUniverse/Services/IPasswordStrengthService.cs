using LoveUniverse.Api.DTOs.Auth;

namespace LoveUniverse.Api.Services;

public interface IPasswordStrengthService
{
    PasswordStrengthResponse CheckStrength(string password);

    ContentServiceResult<PasswordStrengthResponse> ValidateForRegistration(string password);
}
