using LoveUniverse.Api.Entities.Enums;

namespace LoveUniverse.Api.DTOs.Reasons;

public sealed class ReasonReactionResponse
{
    public ReactionType Type { get; set; }

    public int Count { get; set; }

    public bool CurrentUserReacted { get; set; }
}
