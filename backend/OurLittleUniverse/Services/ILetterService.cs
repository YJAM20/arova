using LoveUniverse.Api.DTOs.Letters;

namespace LoveUniverse.Api.Services;

public interface ILetterService
{
    Task<ContentServiceResult<IReadOnlyList<LetterResponse>>> GetLettersAsync(CancellationToken cancellationToken = default);

    Task<ContentServiceResult<LetterResponse>> GetLetterAsync(Guid id, CancellationToken cancellationToken = default);

    Task<ContentServiceResult<LetterResponse>> CreateLetterAsync(LetterCreateRequest request, CancellationToken cancellationToken = default);

    Task<ContentServiceResult<LetterResponse>> UpdateLetterAsync(Guid id, LetterUpdateRequest request, CancellationToken cancellationToken = default);

    Task<ContentServiceResult<bool>> DeleteLetterAsync(Guid id, CancellationToken cancellationToken = default);
}
