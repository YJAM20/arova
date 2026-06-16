using LoveUniverse.Api.Entities.Enums;

namespace LoveUniverse.Api.DTOs.Reasons;

public sealed class ReasonReactionRequest
{
    public ReactionType Type { get; set; } = ReactionType.Heart;
}
