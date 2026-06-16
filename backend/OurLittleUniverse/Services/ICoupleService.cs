using LoveUniverse.Api.DTOs.Couples;

namespace LoveUniverse.Api.Services;

public interface ICoupleService
{
    Task<CoupleServiceResult<CoupleResponse>> CreateCoupleAsync(CreateCoupleRequest request, CancellationToken cancellationToken = default);

    Task<CoupleServiceResult<CoupleResponse>> GetMyCoupleAsync(CancellationToken cancellationToken = default);

    Task<CoupleServiceResult<PairingCodeResponse>> GeneratePairingCodeAsync(CancellationToken cancellationToken = default);

    Task<CoupleServiceResult<CoupleResponse>> JoinCoupleAsync(JoinCoupleRequest request, CancellationToken cancellationToken = default);

    Task<CoupleServiceResult<IReadOnlyList<CoupleMemberResponse>>> GetMembersAsync(CancellationToken cancellationToken = default);
}

public enum CoupleServiceStatus
{
    Success,
    BadRequest,
    Unauthorized,
    Forbidden,
    NotFound
}

public sealed record CoupleServiceResult<T>(
    CoupleServiceStatus Status,
    T? Value,
    string? ErrorMessage)
{
    public static CoupleServiceResult<T> Success(T value)
    {
        return new CoupleServiceResult<T>(CoupleServiceStatus.Success, value, null);
    }

    public static CoupleServiceResult<T> Failure(CoupleServiceStatus status, string errorMessage)
    {
        return new CoupleServiceResult<T>(status, default, errorMessage);
    }
}
