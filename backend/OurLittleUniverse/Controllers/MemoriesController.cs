using LoveUniverse.Api.DTOs.Memories;
using LoveUniverse.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LoveUniverse.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/memories")]
public sealed class MemoriesController : ControllerBase
{
    private readonly IMemoryService _memoryService;

    public MemoriesController(IMemoryService memoryService)
    {
        _memoryService = memoryService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<MemoryResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<MemoryResponse>>> GetMemories(CancellationToken cancellationToken)
    {
        var result = await _memoryService.GetMemoriesAsync(cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(MemoryResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<MemoryResponse>> GetMemory(Guid id, CancellationToken cancellationToken)
    {
        var result = await _memoryService.GetMemoryAsync(id, cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpPost]
    [ProducesResponseType(typeof(MemoryResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<MemoryResponse>> CreateMemory(
        MemoryCreateRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _memoryService.CreateMemoryAsync(request, cancellationToken);
        return ToActionResult(result, success => CreatedAtAction(nameof(GetMemory), new { id = success.Id }, success));
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(MemoryResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<MemoryResponse>> UpdateMemory(
        Guid id,
        MemoryUpdateRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _memoryService.UpdateMemoryAsync(id, request, cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteMemory(Guid id, CancellationToken cancellationToken)
    {
        var result = await _memoryService.DeleteMemoryAsync(id, cancellationToken);
        return ToActionResult(result, _ => NoContent());
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
