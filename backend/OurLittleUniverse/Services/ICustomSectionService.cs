using LoveUniverse.Api.DTOs.CustomSections;

namespace LoveUniverse.Api.Services;

public interface ICustomSectionService
{
    Task<ContentServiceResult<IReadOnlyList<CustomSectionResponse>>> GetSectionsAsync(CancellationToken cancellationToken = default);
    Task<ContentServiceResult<CustomSectionResponse>> CreateSectionAsync(CreateCustomSectionRequest request, CancellationToken cancellationToken = default);
    Task<ContentServiceResult<CustomSectionResponse>> UpdateSectionAsync(Guid id, UpdateCustomSectionRequest request, CancellationToken cancellationToken = default);
    Task<ContentServiceResult<CustomSectionResponse>> DeleteSectionAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ContentServiceResult<CustomSectionItemResponse>> AddItemAsync(Guid sectionId, CreateCustomSectionItemRequest request, CancellationToken cancellationToken = default);
    Task<ContentServiceResult<CustomSectionItemResponse>> UpdateItemAsync(Guid sectionId, Guid itemId, UpdateCustomSectionItemRequest request, CancellationToken cancellationToken = default);
    Task<ContentServiceResult<CustomSectionItemResponse>> DeleteItemAsync(Guid sectionId, Guid itemId, CancellationToken cancellationToken = default);
}
