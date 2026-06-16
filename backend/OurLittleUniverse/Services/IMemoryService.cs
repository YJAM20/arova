using LoveUniverse.Api.DTOs.Memories;

namespace LoveUniverse.Api.Services;

public interface IMemoryService
{
    Task<ContentServiceResult<IReadOnlyList<MemoryResponse>>> GetMemoriesAsync(CancellationToken cancellationToken = default);

    Task<ContentServiceResult<MemoryResponse>> GetMemoryAsync(Guid id, CancellationToken cancellationToken = default);

    Task<ContentServiceResult<MemoryResponse>> CreateMemoryAsync(MemoryCreateRequest request, CancellationToken cancellationToken = default);

    Task<ContentServiceResult<MemoryResponse>> UpdateMemoryAsync(Guid id, MemoryUpdateRequest request, CancellationToken cancellationToken = default);

    Task<ContentServiceResult<bool>> DeleteMemoryAsync(Guid id, CancellationToken cancellationToken = default);
}
