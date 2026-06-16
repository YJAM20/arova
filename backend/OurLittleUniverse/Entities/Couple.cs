namespace LoveUniverse.Api.Entities;

public sealed class Couple
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public Guid CreatedByUserId { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public ICollection<CoupleMember> Members { get; set; } = new List<CoupleMember>();

    public ICollection<PairingCode> PairingCodes { get; set; } = new List<PairingCode>();

    public ICollection<Memory> Memories { get; set; } = new List<Memory>();

    public ICollection<Reason> Reasons { get; set; } = new List<Reason>();

    public ICollection<ReasonReaction> ReasonReactions { get; set; } = new List<ReasonReaction>();

    public ICollection<Letter> Letters { get; set; } = new List<Letter>();

    public ICollection<MoodEntry> MoodEntries { get; set; } = new List<MoodEntry>();

    public ICollection<Song> Songs { get; set; } = new List<Song>();

    public ICollection<Challenge> Challenges { get; set; } = new List<Challenge>();

    public ICollection<ChallengeCompletion> ChallengeCompletions { get; set; } = new List<ChallengeCompletion>();

    public ICollection<FuturePlan> FuturePlans { get; set; } = new List<FuturePlan>();

    public ICollection<ChatMessage> ChatMessages { get; set; } = new List<ChatMessage>();

    public AppUser CreatedByUser { get; set; } = null!;

    public CoupleSettings? Settings { get; set; }

    public CoupleSubscription? Subscription { get; set; }
}
