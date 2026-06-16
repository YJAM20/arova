using LoveUniverse.Api.DTOs.Auth;

namespace LoveUniverse.Api.Services;

public interface IAccountVerificationService
{
    Task<ContentServiceResult<VerificationResponse>> RequestCodeAsync(VerificationCodeRequest request, CancellationToken cancellationToken = default);

    Task<ContentServiceResult<VerificationResponse>> VerifyCodeAsync(VerifyCodeRequest request, CancellationToken cancellationToken = default);
}
