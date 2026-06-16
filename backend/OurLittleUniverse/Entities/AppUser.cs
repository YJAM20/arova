namespace LoveUniverse.Api.Entities;

public sealed class AppUser
{
    public Guid Id { get; set; }

    public string Email { get; set; } = string.Empty;

    public string Username { get; set; } = string.Empty;

    public string? DisplayName { get; set; }

    public string? AvatarUrl { get; set; }

    public string PasswordHash { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public DateTime? EmailVerifiedAt { get; set; }

    public string? PhoneNumber { get; set; }

    public DateTime? PhoneVerifiedAt { get; set; }

    public bool IsVerified { get; set; }

    public DateTime? DateOfBirth { get; set; }

    public string? AgeRange { get; set; }

    public bool MatureContentEnabled { get; set; }

    public bool IsSystemAdmin { get; set; }

    public bool IsAdult => DateOfBirth.HasValue && DateOfBirth.Value <= DateTime.UtcNow.Date.AddYears(-18);

    public DateTime? LastSeenAt { get; set; }

    public DateTime? LastLoginAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public ICollection<Couple> CouplesCreated { get; set; } = new List<Couple>();

    public ICollection<CoupleMember> CoupleMemberships { get; set; } = new List<CoupleMember>();

    public ICollection<PairingCode> PairingCodesCreated { get; set; } = new List<PairingCode>();

    public ICollection<PairingCode> PairingCodesUsed { get; set; } = new List<PairingCode>();

    public ICollection<Memory> MemoriesCreated { get; set; } = new List<Memory>();

    public ICollection<Reason> ReasonsCreated { get; set; } = new List<Reason>();

    public ICollection<ReasonReaction> ReasonReactions { get; set; } = new List<ReasonReaction>();

    public ICollection<Letter> LettersCreated { get; set; } = new List<Letter>();

    public ICollection<MoodEntry> MoodEntries { get; set; } = new List<MoodEntry>();

    public ICollection<Song> SongsCreated { get; set; } = new List<Song>();

    public ICollection<Challenge> ChallengesCreated { get; set; } = new List<Challenge>();

    public ICollection<ChallengeCompletion> ChallengeCompletions { get; set; } = new List<ChallengeCompletion>();

    public ICollection<FuturePlan> FuturePlansCreated { get; set; } = new List<FuturePlan>();

    public ICollection<ChatMessage> ChatMessages { get; set; } = new List<ChatMessage>();

    public ICollection<AccountVerificationCode> VerificationCodes { get; set; } = new List<AccountVerificationCode>();

    public ICollection<UserOnboardingAnswer> OnboardingAnswers { get; set; } = new List<UserOnboardingAnswer>();

    public UserProfile? Profile { get; set; }

    public ICollection<FeedbackEntry> FeedbackEntries { get; set; } = new List<FeedbackEntry>();
}
