using LoveUniverse.Api.DTOs.CustomSections;
using LoveUniverse.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LoveUniverse.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/custom-sections")]
public sealed class CustomSectionsController : ControllerBase
{
    private readonly ICustomSectionService _customSectionService;

    public CustomSectionsController(ICustomSectionService customSectionService)
    {
        _customSectionService = customSectionService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<CustomSectionResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<CustomSectionResponse>>> GetSections(CancellationToken cancellationToken)
    {
        var result = await _customSectionService.GetSectionsAsync(cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpPost]
    [ProducesResponseType(typeof(CustomSectionResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<CustomSectionResponse>> CreateSection(
        CreateCustomSectionRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _customSectionService.CreateSectionAsync(request, cancellationToken);
        return ToActionResult(result, success => CreatedAtAction(nameof(GetSections), new { id = success.Id }, success));
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(CustomSectionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CustomSectionResponse>> UpdateSection(
        Guid id,
        UpdateCustomSectionRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _customSectionService.UpdateSectionAsync(id, request, cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(CustomSectionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CustomSectionResponse>> DeleteSection(Guid id, CancellationToken cancellationToken)
    {
        var result = await _customSectionService.DeleteSectionAsync(id, cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpPost("{id:guid}/items")]
    [ProducesResponseType(typeof(CustomSectionItemResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CustomSectionItemResponse>> AddItem(
        Guid id,
        CreateCustomSectionItemRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _customSectionService.AddItemAsync(id, request, cancellationToken);
        return ToActionResult(result, success => CreatedAtAction(nameof(GetSections), new { id }, success));
    }

    [HttpPut("{sectionId:guid}/items/{itemId:guid}")]
    [ProducesResponseType(typeof(CustomSectionItemResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CustomSectionItemResponse>> UpdateItem(
        Guid sectionId,
        Guid itemId,
        UpdateCustomSectionItemRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _customSectionService.UpdateItemAsync(sectionId, itemId, request, cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpDelete("{sectionId:guid}/items/{itemId:guid}")]
    [ProducesResponseType(typeof(CustomSectionItemResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CustomSectionItemResponse>> DeleteItem(
        Guid sectionId,
        Guid itemId,
        CancellationToken cancellationToken)
    {
        var result = await _customSectionService.DeleteItemAsync(sectionId, itemId, cancellationToken);
        return ToActionResult(result, Ok);
    }

    private ActionResult ToActionResult<T>(
        ContentServiceResult<T> result,
        Func<T, ActionResult> onSuccess)
    {
        if (result.Status == ContentServiceStatus.Success && result.Value is not null)
        {
            return onSuccess(result.Value);
        }

        var error = new { message = result.ErrorMessage ?? "The request could not be completed." };
        return result.Status switch
        {
            ContentServiceStatus.BadRequest => BadRequest(error),
            ContentServiceStatus.Unauthorized => Unauthorized(error),
            ContentServiceStatus.Forbidden => StatusCode(StatusCodes.Status403Forbidden, error),
            ContentServiceStatus.NotFound => NotFound(error),
            _ => BadRequest(error)
        };
    }
}
