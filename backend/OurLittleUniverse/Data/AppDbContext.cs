using LoveUniverse.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace LoveUniverse.Api.Data;

public sealed class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<AppUser> AppUsers => Set<AppUser>();

    public DbSet<Couple> Couples => Set<Couple>();

    public DbSet<CoupleMember> CoupleMembers => Set<CoupleMember>();

    public DbSet<PairingCode> PairingCodes => Set<PairingCode>();

    public DbSet<Memory> Memories => Set<Memory>();

    public DbSet<Reason> Reasons => Set<Reason>();

    public DbSet<ReasonReaction> ReasonReactions => Set<ReasonReaction>();

    public DbSet<Letter> Letters => Set<Letter>();

    public DbSet<MoodEntry> MoodEntries => Set<MoodEntry>();

    public DbSet<Song> Songs => Set<Song>();

    public DbSet<Challenge> Challenges => Set<Challenge>();

    public DbSet<ChallengeCompletion> ChallengeCompletions => Set<ChallengeCompletion>();

    public DbSet<FuturePlan> FuturePlans => Set<FuturePlan>();

    public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();

    public DbSet<CoupleSettings> CoupleSettings => Set<CoupleSettings>();

    public DbSet<CoupleSubscription> CoupleSubscriptions => Set<CoupleSubscription>();

    public DbSet<AccountVerificationCode> AccountVerificationCodes => Set<AccountVerificationCode>();

    public DbSet<OnboardingQuestion> OnboardingQuestions => Set<OnboardingQuestion>();

    public DbSet<UserOnboardingAnswer> UserOnboardingAnswers => Set<UserOnboardingAnswer>();

    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();

    public DbSet<FeedbackEntry> FeedbackEntries => Set<FeedbackEntry>();

    public DbSet<PlanetDefinition> PlanetDefinitions => Set<PlanetDefinition>();
    public DbSet<PlanetTaskDefinition> PlanetTaskDefinitions => Set<PlanetTaskDefinition>();
    public DbSet<DailyCouplePlanet> DailyCouplePlanets => Set<DailyCouplePlanet>();
    public DbSet<DailyPlanetTaskCompletion> DailyPlanetTaskCompletions => Set<DailyPlanetTaskCompletion>();
    public DbSet<RelationshipPointLedger> RelationshipPointLedgers => Set<RelationshipPointLedger>();
    public DbSet<RelationshipDailyTask> RelationshipDailyTasks => Set<RelationshipDailyTask>();
    public DbSet<CustomSection> CustomSections => Set<CustomSection>();
    public DbSet<CustomSectionItem> CustomSectionItems => Set<CustomSectionItem>();
    public DbSet<DailyQuestion> DailyQuestions => Set<DailyQuestion>();
    public DbSet<DailyQuestionAnswer> DailyQuestionAnswers => Set<DailyQuestionAnswer>();
    public DbSet<CheckIn> CheckIns => Set<CheckIn>();
    public DbSet<ImportantDate> ImportantDates => Set<ImportantDate>();
    public DbSet<CoupleGoal> CoupleGoals => Set<CoupleGoal>();
    public DbSet<CoupleGoalMilestone> CoupleGoalMilestones => Set<CoupleGoalMilestone>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        ConfigureAppUser(modelBuilder);
        ConfigureCouple(modelBuilder);
        ConfigureCoupleMember(modelBuilder);
        ConfigurePairingCode(modelBuilder);
        ConfigureMemory(modelBuilder);
        ConfigureReason(modelBuilder);
        ConfigureReasonReaction(modelBuilder);
        ConfigureLetter(modelBuilder);
        ConfigureMoodEntry(modelBuilder);
        ConfigureSong(modelBuilder);
        ConfigureChallenge(modelBuilder);
        ConfigureChallengeCompletion(modelBuilder);
        ConfigureFuturePlan(modelBuilder);
        ConfigureChatMessage(modelBuilder);
        ConfigureCoupleSettings(modelBuilder);
        ConfigureCoupleSubscription(modelBuilder);
        ConfigureAccountVerificationCode(modelBuilder);
        ConfigureOnboardingQuestion(modelBuilder);
        ConfigureUserOnboardingAnswer(modelBuilder);
        ConfigureUserProfile(modelBuilder);
        ConfigureFeedbackEntry(modelBuilder);

        ConfigurePlanetDefinition(modelBuilder);
        ConfigurePlanetTaskDefinition(modelBuilder);
        ConfigureDailyCouplePlanet(modelBuilder);
        ConfigureDailyPlanetTaskCompletion(modelBuilder);
        ConfigureRelationshipPointLedger(modelBuilder);
        ConfigureRelationshipDailyTask(modelBuilder);
        ConfigureCustomSection(modelBuilder);
        ConfigureCustomSectionItem(modelBuilder);

        ConfigureDailyQuestion(modelBuilder);
        ConfigureDailyQuestionAnswer(modelBuilder);
        ConfigureCheckIn(modelBuilder);
        ConfigureImportantDate(modelBuilder);
        ConfigureCoupleGoal(modelBuilder);
        ConfigureCoupleGoalMilestone(modelBuilder);
    }

    private static void ConfigureAppUser(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<AppUser>();

        entity.HasKey(user => user.Id);
        entity.Property(user => user.Email).HasMaxLength(256).IsRequired();
        entity.Property(user => user.Username).HasMaxLength(64).IsRequired();
        entity.Property(user => user.DisplayName).HasMaxLength(120);
        entity.Property(user => user.AvatarUrl).HasMaxLength(2048);
        entity.Property(user => user.PasswordHash).HasMaxLength(512).IsRequired();
        entity.Property(user => user.PhoneNumber).HasMaxLength(40);
        entity.Property(user => user.AgeRange).HasMaxLength(40);
        entity.Property(user => user.IsVerified).IsRequired();
        entity.Property(user => user.MatureContentEnabled).IsRequired();
        entity.Property(user => user.CreatedAt).IsRequired();
        entity.Ignore(user => user.IsAdult);

        entity.HasIndex(user => user.Email).IsUnique();
        entity.HasIndex(user => user.Username).IsUnique();
        entity.HasIndex(user => user.CreatedAt);
    }

    private static void ConfigureCouple(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<Couple>();

        entity.HasKey(couple => couple.Id);
        entity.Property(couple => couple.Name).HasMaxLength(120).IsRequired();
        entity.Property(couple => couple.Description).HasMaxLength(1000);
        entity.Property(couple => couple.CreatedByUserId).IsRequired();
        entity.Property(couple => couple.IsActive).IsRequired();
        entity.Property(couple => couple.CreatedAt).IsRequired();

        entity.HasIndex(couple => couple.CreatedByUserId);
        entity.HasIndex(couple => couple.CreatedAt);

        entity
            .HasOne(couple => couple.CreatedByUser)
            .WithMany(user => user.CouplesCreated)
            .HasForeignKey(couple => couple.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private static void ConfigureCoupleMember(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<CoupleMember>();

        entity.HasKey(member => member.Id);
        entity.Property(member => member.Role).HasConversion<string>().HasMaxLength(32).IsRequired();
        entity.Property(member => member.JoinedAt).IsRequired();
        entity.Property(member => member.CreatedAt).IsRequired();

        entity.HasIndex(member => member.CoupleId);
        entity.HasIndex(member => member.UserId);
        entity.HasIndex(member => member.CreatedAt);
        entity.HasIndex(member => new { member.CoupleId, member.UserId }).IsUnique();

        entity
            .HasOne(member => member.Couple)
            .WithMany(couple => couple.Members)
            .HasForeignKey(member => member.CoupleId)
            .OnDelete(DeleteBehavior.Restrict);

        entity
            .HasOne(member => member.User)
            .WithMany(user => user.CoupleMemberships)
            .HasForeignKey(member => member.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private static void ConfigurePairingCode(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<PairingCode>();

        entity.HasKey(pairingCode => pairingCode.Id);
        entity.Property(pairingCode => pairingCode.Code).HasMaxLength(32).IsRequired();
        entity.Property(pairingCode => pairingCode.ExpiresAt).IsRequired();
        entity.Property(pairingCode => pairingCode.CreatedAt).IsRequired();

        entity.HasIndex(pairingCode => pairingCode.Code).IsUnique();
        entity.HasIndex(pairingCode => pairingCode.CoupleId);
        entity.HasIndex(pairingCode => pairingCode.CreatedByUserId);
        entity.HasIndex(pairingCode => pairingCode.UsedByUserId);
        entity.HasIndex(pairingCode => pairingCode.CreatedAt);

        entity
            .HasOne(pairingCode => pairingCode.Couple)
            .WithMany(couple => couple.PairingCodes)
            .HasForeignKey(pairingCode => pairingCode.CoupleId)
            .OnDelete(DeleteBehavior.Restrict);

        entity
            .HasOne(pairingCode => pairingCode.CreatedByUser)
            .WithMany(user => user.PairingCodesCreated)
            .HasForeignKey(pairingCode => pairingCode.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        entity
            .HasOne(pairingCode => pairingCode.UsedByUser)
            .WithMany(user => user.PairingCodesUsed)
            .HasForeignKey(pairingCode => pairingCode.UsedByUserId)
            .OnDelete(DeleteBehavior.SetNull);
    }

    private static void ConfigureMemory(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<Memory>();

        entity.HasKey(memory => memory.Id);
        entity.Property(memory => memory.Title).HasMaxLength(160).IsRequired();
        entity.Property(memory => memory.Description).HasMaxLength(4000);
        entity.Property(memory => memory.PrivateNote).HasMaxLength(4000);
        entity.Property(memory => memory.Location).HasMaxLength(240);
        entity.Property(memory => memory.MediaUrl).HasMaxLength(2048);
        entity.Property(memory => memory.VisibilityLevel).HasConversion<string>().HasMaxLength(32).IsRequired();
        entity.Property(memory => memory.CreatedAt).IsRequired();

        entity.HasIndex(memory => memory.CoupleId);
        entity.HasIndex(memory => memory.CreatedByUserId);
        entity.HasIndex(memory => memory.CreatedAt);

        ConfigureCoupleAndCreatorRelationships(
            entity,
            memory => memory.Couple,
            couple => couple.Memories,
            memory => memory.CoupleId,
            memory => memory.CreatedByUser,
            user => user.MemoriesCreated,
            memory => memory.CreatedByUserId);
    }

    private static void ConfigureReason(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<Reason>();

        entity.HasKey(reason => reason.Id);
        entity.Property(reason => reason.Text).HasMaxLength(2000).IsRequired();
        entity.Property(reason => reason.VisibilityLevel).HasConversion<string>().HasMaxLength(32).IsRequired();
        entity.Property(reason => reason.UnlockDate);
        entity.Property(reason => reason.CreatedAt).IsRequired();

        entity.HasIndex(reason => reason.CoupleId);
        entity.HasIndex(reason => reason.CreatedByUserId);
        entity.HasIndex(reason => reason.CreatedAt);

        ConfigureCoupleAndCreatorRelationships(
            entity,
            reason => reason.Couple,
            couple => couple.Reasons,
            reason => reason.CoupleId,
            reason => reason.CreatedByUser,
            user => user.ReasonsCreated,
            reason => reason.CreatedByUserId);
    }

    private static void ConfigureReasonReaction(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<ReasonReaction>();

        entity.HasKey(reaction => reaction.Id);
        entity.Property(reaction => reaction.ReactionType).HasConversion<string>().HasMaxLength(32).IsRequired();
        entity.Property(reaction => reaction.CreatedAt).IsRequired();

        entity.HasIndex(reaction => reaction.ReasonId);
        entity.HasIndex(reaction => reaction.CoupleId);
        entity.HasIndex(reaction => reaction.UserId);
        entity.HasIndex(reaction => reaction.CreatedAt);
        entity.HasIndex(reaction => new { reaction.ReasonId, reaction.UserId, reaction.ReactionType }).IsUnique();

        entity
            .HasOne(reaction => reaction.Reason)
            .WithMany(reason => reason.Reactions)
            .HasForeignKey(reaction => reaction.ReasonId)
            .OnDelete(DeleteBehavior.Cascade);

        entity
            .HasOne(reaction => reaction.Couple)
            .WithMany(couple => couple.ReasonReactions)
            .HasForeignKey(reaction => reaction.CoupleId)
            .OnDelete(DeleteBehavior.Restrict);

        entity
            .HasOne(reaction => reaction.User)
            .WithMany(user => user.ReasonReactions)
            .HasForeignKey(reaction => reaction.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private static void ConfigureLetter(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<Letter>();

        entity.HasKey(letter => letter.Id);
        entity.Property(letter => letter.Title).HasMaxLength(160).IsRequired();
        entity.Property(letter => letter.Body).IsRequired();
        entity.Property(letter => letter.IsLocked).IsRequired();
        entity.Property(letter => letter.PasscodeHash).HasMaxLength(512);
        entity.Property(letter => letter.VisibilityLevel).HasConversion<string>().HasMaxLength(32).IsRequired();
        entity.Property(letter => letter.CreatedAt).IsRequired();

        entity.HasIndex(letter => letter.CoupleId);
        entity.HasIndex(letter => letter.CreatedByUserId);
        entity.HasIndex(letter => letter.CreatedAt);

        ConfigureCoupleAndCreatorRelationships(
            entity,
            letter => letter.Couple,
            couple => couple.Letters,
            letter => letter.CoupleId,
            letter => letter.CreatedByUser,
            user => user.LettersCreated,
            letter => letter.CreatedByUserId);
    }

    private static void ConfigureMoodEntry(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<MoodEntry>();

        entity.HasKey(moodEntry => moodEntry.Id);
        entity.Property(moodEntry => moodEntry.Note).HasMaxLength(1000);
        entity.Property(moodEntry => moodEntry.Response).HasMaxLength(1000);
        entity.Property(moodEntry => moodEntry.CreatedAt).IsRequired();

        entity.HasIndex(moodEntry => moodEntry.CoupleId);
        entity.HasIndex(moodEntry => moodEntry.UserId);
        entity.HasIndex(moodEntry => moodEntry.CreatedAt);
        entity.HasIndex(moodEntry => new { moodEntry.CoupleId, moodEntry.UserId, moodEntry.EntryDate }).IsUnique();

        entity
            .HasOne(moodEntry => moodEntry.Couple)
            .WithMany(couple => couple.MoodEntries)
            .HasForeignKey(moodEntry => moodEntry.CoupleId)
            .OnDelete(DeleteBehavior.Restrict);

        entity
            .HasOne(moodEntry => moodEntry.User)
            .WithMany(user => user.MoodEntries)
            .HasForeignKey(moodEntry => moodEntry.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        entity
            .HasOne(moodEntry => moodEntry.RespondedByUser)
            .WithMany()
            .HasForeignKey(moodEntry => moodEntry.RespondedByUserId)
            .OnDelete(DeleteBehavior.SetNull);
    }

    private static void ConfigureSong(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<Song>();

        entity.HasKey(song => song.Id);
        entity.Property(song => song.Title).HasMaxLength(200).IsRequired();
        entity.Property(song => song.Artist).HasMaxLength(200);
        entity.Property(song => song.ExternalUrl).HasMaxLength(2048);
        entity.Property(song => song.AudioUrl).HasMaxLength(2048);
        entity.Property(song => song.CoverUrl).HasMaxLength(2048);
        entity.Property(song => song.License).HasMaxLength(200);
        entity.Property(song => song.Attribution).HasMaxLength(1000);
        entity.Property(song => song.Notes).HasMaxLength(2000);
        entity.Property(song => song.IsFavorite).IsRequired();
        entity.Property(song => song.VisibilityLevel).HasConversion<string>().HasMaxLength(32).IsRequired();
        entity.Property(song => song.CreatedAt).IsRequired();

        entity.HasIndex(song => song.CoupleId);
        entity.HasIndex(song => song.CreatedByUserId);
        entity.HasIndex(song => song.CreatedAt);

        ConfigureCoupleAndCreatorRelationships(
            entity,
            song => song.Couple,
            couple => couple.Songs,
            song => song.CoupleId,
            song => song.CreatedByUser,
            user => user.SongsCreated,
            song => song.CreatedByUserId);

        entity
            .HasOne(song => song.FavoritedByUser)
            .WithMany()
            .HasForeignKey(song => song.FavoritedByUserId)
            .OnDelete(DeleteBehavior.SetNull);
    }

    private static void ConfigureChallenge(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<Challenge>();

        entity.HasKey(challenge => challenge.Id);
        entity.Property(challenge => challenge.Title).HasMaxLength(200).IsRequired();
        entity.Property(challenge => challenge.Description).HasMaxLength(4000);
        entity.Property(challenge => challenge.CreatedAt).IsRequired();

        entity.HasIndex(challenge => challenge.CoupleId);
        entity.HasIndex(challenge => challenge.CreatedByUserId);
        entity.HasIndex(challenge => challenge.CreatedAt);

        ConfigureCoupleAndCreatorRelationships(
            entity,
            challenge => challenge.Couple,
            couple => couple.Challenges,
            challenge => challenge.CoupleId,
            challenge => challenge.CreatedByUser,
            user => user.ChallengesCreated,
            challenge => challenge.CreatedByUserId);
    }

    private static void ConfigureChallengeCompletion(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<ChallengeCompletion>();

        entity.HasKey(completion => completion.Id);
        entity.Property(completion => completion.Note).HasMaxLength(1000);
        entity.Property(completion => completion.CompletedAt).IsRequired();
        entity.Property(completion => completion.CreatedAt).IsRequired();

        entity.HasIndex(completion => completion.ChallengeId);
        entity.HasIndex(completion => completion.CoupleId);
        entity.HasIndex(completion => completion.UserId);
        entity.HasIndex(completion => completion.CreatedAt);
        entity.HasIndex(completion => new { completion.ChallengeId, completion.UserId }).IsUnique();

        entity
            .HasOne(completion => completion.Challenge)
            .WithMany(challenge => challenge.Completions)
            .HasForeignKey(completion => completion.ChallengeId)
            .OnDelete(DeleteBehavior.Cascade);

        entity
            .HasOne(completion => completion.Couple)
            .WithMany(couple => couple.ChallengeCompletions)
            .HasForeignKey(completion => completion.CoupleId)
            .OnDelete(DeleteBehavior.Restrict);

        entity
            .HasOne(completion => completion.User)
            .WithMany(user => user.ChallengeCompletions)
            .HasForeignKey(completion => completion.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private static void ConfigureFuturePlan(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<FuturePlan>();

        entity.HasKey(plan => plan.Id);
        entity.Property(plan => plan.Title).HasMaxLength(200).IsRequired();
        entity.Property(plan => plan.Description).HasMaxLength(4000);
        entity.Property(plan => plan.VisibilityLevel).HasConversion<string>().HasMaxLength(32).IsRequired();
        entity.Property(plan => plan.CreatedAt).IsRequired();

        entity.HasIndex(plan => plan.CoupleId);
        entity.HasIndex(plan => plan.CreatedByUserId);
        entity.HasIndex(plan => plan.CreatedAt);

        ConfigureCoupleAndCreatorRelationships(
            entity,
            plan => plan.Couple,
            couple => couple.FuturePlans,
            plan => plan.CoupleId,
            plan => plan.CreatedByUser,
            user => user.FuturePlansCreated,
            plan => plan.CreatedByUserId);
    }

    private static void ConfigureChatMessage(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<ChatMessage>();

        entity.HasKey(message => message.Id);
        entity.Property(message => message.Message).HasMaxLength(4000).IsRequired();
        entity.Property(message => message.MessageType).HasConversion<string>().HasMaxLength(32).IsRequired();
        entity.Property(message => message.AttachmentUrl).HasMaxLength(2048);
        entity.Property(message => message.AttachmentMimeType).HasMaxLength(120);
        entity.Property(message => message.EncryptionMode).HasMaxLength(40).IsRequired();
        entity.Property(message => message.EncryptedPayload);
        entity.Property(message => message.Nonce).HasMaxLength(256);
        entity.Property(message => message.KeyId).HasMaxLength(256);
        entity.Property(message => message.SentAt).IsRequired();
        entity.Property(message => message.CreatedAt).IsRequired();

        entity.HasIndex(message => message.CoupleId);
        entity.HasIndex(message => message.UserId);
        entity.HasIndex(message => message.CreatedAt);

        entity
            .HasOne(message => message.Couple)
            .WithMany(couple => couple.ChatMessages)
            .HasForeignKey(message => message.CoupleId)
            .OnDelete(DeleteBehavior.Restrict);

        entity
            .HasOne(message => message.User)
            .WithMany(user => user.ChatMessages)
            .HasForeignKey(message => message.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private static void ConfigureCoupleSettings(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<CoupleSettings>();

        entity.HasKey(settings => settings.Id);
        entity.Property(settings => settings.TimeZone).HasMaxLength(120).IsRequired();
        entity.Property(settings => settings.ActiveTheme).HasMaxLength(80).IsRequired();
        entity.Property(settings => settings.LanguageMode).HasMaxLength(40).IsRequired();
        entity.Property(settings => settings.AnimationsEnabled).IsRequired();
        entity.Property(settings => settings.MusicEnabled).IsRequired();
        entity.Property(settings => settings.EmailNotificationsEnabled).IsRequired();
        entity.Property(settings => settings.DailyDigestEnabled).IsRequired();
        entity.Property(settings => settings.PartnerActivityEmailsEnabled).IsRequired();
        entity.Property(settings => settings.CreatedAt).IsRequired();

        entity.HasIndex(settings => settings.CoupleId).IsUnique();
        entity.HasIndex(settings => settings.CreatedAt);

        entity
            .HasOne(settings => settings.Couple)
            .WithOne(couple => couple.Settings)
            .HasForeignKey<CoupleSettings>(settings => settings.CoupleId)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private static void ConfigureCoupleSubscription(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<CoupleSubscription>();

        entity.HasKey(subscription => subscription.Id);
        entity.Property(subscription => subscription.PlanType).HasConversion<string>().HasMaxLength(32).IsRequired();
        entity.Property(subscription => subscription.Status).HasMaxLength(64).IsRequired();
        entity.Property(subscription => subscription.IsGifted).IsRequired();
        entity.Property(subscription => subscription.StartedAt).IsRequired();
        entity.Property(subscription => subscription.CreatedAt).IsRequired();

        entity.HasIndex(subscription => subscription.CoupleId).IsUnique();
        entity.HasIndex(subscription => subscription.CreatedAt);

        entity
            .HasOne(subscription => subscription.Couple)
            .WithOne(couple => couple.Subscription)
            .HasForeignKey<CoupleSubscription>(subscription => subscription.CoupleId)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private static void ConfigureAccountVerificationCode(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<AccountVerificationCode>();

        entity.HasKey(code => code.Id);
        entity.Property(code => code.Channel).HasConversion<string>().HasMaxLength(32).IsRequired();
        entity.Property(code => code.Destination).HasMaxLength(256).IsRequired();
        entity.Property(code => code.CodeHash).HasMaxLength(512).IsRequired();
        entity.Property(code => code.Purpose).HasConversion<string>().HasMaxLength(32).IsRequired();
        entity.Property(code => code.ExpiresAt).IsRequired();
        entity.Property(code => code.Attempts).IsRequired();
        entity.Property(code => code.CreatedAt).IsRequired();

        entity.HasIndex(code => code.UserId);
        entity.HasIndex(code => code.Destination);
        entity.HasIndex(code => code.ExpiresAt);

        entity
            .HasOne(code => code.User)
            .WithMany(user => user.VerificationCodes)
            .HasForeignKey(code => code.UserId)
            .OnDelete(DeleteBehavior.SetNull);
    }

    private static void ConfigureOnboardingQuestion(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<OnboardingQuestion>();

        entity.HasKey(question => question.Id);
        entity.Property(question => question.Key).HasMaxLength(120).IsRequired();
        entity.Property(question => question.TextEn).HasMaxLength(500).IsRequired();
        entity.Property(question => question.TextAr).HasMaxLength(500).IsRequired();
        entity.Property(question => question.TextEs).HasMaxLength(500).IsRequired();
        entity.Property(question => question.Type).HasMaxLength(40).IsRequired();
        entity.Property(question => question.Category).HasMaxLength(80).IsRequired();
        entity.Property(question => question.IsRequired).IsRequired();
        entity.Property(question => question.IsQuickStart).IsRequired();
        entity.Property(question => question.SortOrder).IsRequired();
        entity.Property(question => question.IsActive).IsRequired();

        entity.HasIndex(question => question.Key).IsUnique();
        entity.HasIndex(question => question.SortOrder);

        entity.HasData(GetOnboardingQuestionSeed());
    }

    private static void ConfigureUserOnboardingAnswer(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<UserOnboardingAnswer>();

        entity.HasKey(answer => answer.Id);
        entity.Property(answer => answer.QuestionKey).HasMaxLength(120).IsRequired();
        entity.Property(answer => answer.AnswerValue).HasMaxLength(2000).IsRequired();
        entity.Property(answer => answer.CreatedAt).IsRequired();

        entity.HasIndex(answer => answer.UserId);
        entity.HasIndex(answer => new { answer.UserId, answer.QuestionKey }).IsUnique();

        entity
            .HasOne(answer => answer.User)
            .WithMany(user => user.OnboardingAnswers)
            .HasForeignKey(answer => answer.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    private static void ConfigureUserProfile(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<UserProfile>();

        entity.HasKey(profile => profile.Id);
        entity.Property(profile => profile.DisplayName).HasMaxLength(120).IsRequired();
        entity.Property(profile => profile.AgeRange).HasMaxLength(40);
        entity.Property(profile => profile.RelationshipStatus).HasMaxLength(80);
        entity.Property(profile => profile.RelationshipType).HasMaxLength(80);
        entity.Property(profile => profile.PersonalityStyle).HasMaxLength(120);
        entity.Property(profile => profile.LoveLanguage).HasMaxLength(120);
        entity.Property(profile => profile.PreferredTheme).HasMaxLength(80);
        entity.Property(profile => profile.PreferredLanguage).HasMaxLength(8);
        entity.Property(profile => profile.AvatarUrl).HasMaxLength(2048);
        entity.Property(profile => profile.Bio).HasMaxLength(1000);
        entity.Property(profile => profile.MatureContentEnabled).IsRequired();
        entity.Property(profile => profile.UpdatedAt).IsRequired();

        entity.HasIndex(profile => profile.UserId).IsUnique();

        entity
            .HasOne(profile => profile.User)
            .WithOne(user => user.Profile)
            .HasForeignKey<UserProfile>(profile => profile.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    private static void ConfigureFeedbackEntry(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<FeedbackEntry>();

        entity.HasKey(feedback => feedback.Id);
        entity.Property(feedback => feedback.Message).HasMaxLength(2000).IsRequired();
        entity.Property(feedback => feedback.Email).HasMaxLength(256);
        entity.Property(feedback => feedback.Context).HasMaxLength(200);
        entity.Property(feedback => feedback.CreatedAt).IsRequired();

        entity.HasIndex(feedback => feedback.CreatedAt);
        entity.HasIndex(feedback => feedback.UserId);

        entity
            .HasOne(feedback => feedback.User)
            .WithMany(user => user.FeedbackEntries)
            .HasForeignKey(feedback => feedback.UserId)
            .OnDelete(DeleteBehavior.SetNull);
    }

    private static OnboardingQuestion[] GetOnboardingQuestionSeed()
    {
        return
        [
            Question("10000000-0000-0000-0000-000000000001", "display_name", "What name should Arova use for you?", "ما الاسم الذي تريد أن تستخدمه Arova لك؟", "¿Qué nombre debe usar Arova para ti?", "text", "identity", true, true, 10),
            Question("10000000-0000-0000-0000-000000000002", "age_or_birthdate", "What age range or birthdate would you like to share?", "ما الفئة العمرية أو تاريخ الميلاد الذي تريد مشاركته؟", "¿Qué rango de edad o fecha de nacimiento quieres compartir?", "text", "identity", true, true, 20),
            Question("10000000-0000-0000-0000-000000000003", "preferred_language", "Which language should Arova use first?", "ما اللغة التي يجب أن تستخدمها Arova أولاً؟", "¿Qué idioma debe usar Arova primero?", "singleChoice", "preferences", true, true, 30),
            Question("10000000-0000-0000-0000-000000000004", "relationship_type", "How would you describe this shared space?", "كيف تصف هذه المساحة المشتركة؟", "¿Cómo describirías este espacio compartido?", "singleChoice", "relationship", true, true, 40),
            Question("10000000-0000-0000-0000-000000000005", "what_should_arova_help_with", "What should Arova help you both with most?", "ما أكثر شيء تريدان أن تساعدكما فيه Arova؟", "¿En qué debería ayudarles más Arova?", "multiChoice", "personalization", true, true, 50),
            Question("10000000-0000-0000-0000-000000000006", "preferred_space_tone", "What tone should your space feel like?", "ما الشعور الذي تريده لمساحتكما؟", "¿Qué tono debería tener su espacio?", "singleChoice", "preferences", true, true, 60),
            Question("10000000-0000-0000-0000-000000000007", "create_or_join_space", "Do you want to create a space or join one?", "هل تريد إنشاء مساحة أم الانضمام إلى مساحة؟", "¿Quieres crear un espacio o unirte a uno?", "singleChoice", "relationship", true, true, 70),
            Question("10000000-0000-0000-0000-000000000008", "daily_checkin_style", "How often do you enjoy simple check-ins?", "كم مرة تفضل تسجيل الاطمئنان البسيط؟", "¿Con qué frecuencia prefieres los registros simples?", "singleChoice", "mood", false, false, 110),
            Question("10000000-0000-0000-0000-000000000009", "favorite_memory_type", "What kind of memories matter most to you?", "ما نوع الذكريات الأهم بالنسبة لك؟", "¿Qué tipo de recuerdos te importan más?", "multiChoice", "relationship", false, false, 120),
            Question("10000000-0000-0000-0000-000000000010", "communication_preference", "How do you prefer to stay connected?", "كيف تفضل البقاء على تواصل؟", "¿Cómo prefieres mantenerte conectado?", "multiChoice", "communication", false, false, 130),
            Question("10000000-0000-0000-0000-000000000011", "quiet_support_style", "What kind of support feels good on hard days?", "ما نوع الدعم الذي يناسبك في الأيام الصعبة؟", "¿Qué tipo de apoyo se siente bien en días difíciles?", "multiChoice", "communication", false, false, 140),
            Question("10000000-0000-0000-0000-000000000012", "celebration_style", "How do you like to celebrate small wins?", "كيف تحب الاحتفال بالإنجازات الصغيرة؟", "¿Cómo te gusta celebrar los pequeños logros?", "multiChoice", "preferences", false, false, 150),
            Question("10000000-0000-0000-0000-000000000013", "love_language_primary", "Which expressions of care feel most meaningful?", "ما طرق التعبير عن الاهتمام الأكثر معنى لك؟", "¿Qué expresiones de cariño son más significativas para ti?", "multiChoice", "love-language", false, false, 160),
            Question("10000000-0000-0000-0000-000000000014", "mood_prompt_preference", "What kind of mood prompts feel helpful?", "ما نوع أسئلة المزاج التي تبدو مفيدة؟", "¿Qué tipo de preguntas de ánimo te ayudan?", "multiChoice", "mood", false, false, 170),
            Question("10000000-0000-0000-0000-000000000015", "conflict_reset_style", "After a disagreement, what helps you reset?", "بعد الخلاف، ما الذي يساعدك على العودة بهدوء؟", "Después de un desacuerdo, ¿qué te ayuda a recomenzar?", "multiChoice", "conflict", false, false, 180),
            Question("10000000-0000-0000-0000-000000000016", "distance_support", "If you spend time apart, what helps you feel close?", "إذا ابتعدتما لفترة، ما الذي يساعدك على الشعور بالقرب؟", "Si pasan tiempo separados, ¿qué les ayuda a sentirse cerca?", "multiChoice", "distance", false, false, 190),
            Question("10000000-0000-0000-0000-000000000017", "privacy_comfort", "What should stay more private by default?", "ما الذي يجب أن يبقى أكثر خصوصية افتراضياً؟", "¿Qué debería ser más privado por defecto?", "multiChoice", "privacy", false, false, 200),
            Question("10000000-0000-0000-0000-000000000018", "future_board_style", "How do you like to plan future ideas?", "كيف تحب تخطيط الأفكار المستقبلية؟", "¿Cómo te gusta planear ideas futuras?", "multiChoice", "future", false, false, 210),
            Question("10000000-0000-0000-0000-000000000019", "ritual_preference", "What small rituals would you enjoy?", "ما الطقوس الصغيرة التي قد تستمتع بها؟", "¿Qué pequeños rituales disfrutarías?", "multiChoice", "relationship", false, false, 220),
            Question("10000000-0000-0000-0000-000000000020", "profile_customization", "How much profile personalization do you want?", "ما مقدار تخصيص الملف الشخصي الذي تريده؟", "¿Cuánta personalización de perfil quieres?", "singleChoice", "personalization", false, false, 230),
            Question("10000000-0000-0000-0000-000000000021", "theme_preference", "What visual mood do you prefer?", "ما النمط البصري الذي تفضله؟", "¿Qué estilo visual prefieres?", "singleChoice", "preferences", false, false, 240),
            Question("10000000-0000-0000-0000-000000000022", "question_depth", "How deep should daily questions usually be?", "ما العمق المناسب عادة للأسئلة اليومية؟", "¿Qué tan profundas deberían ser las preguntas diarias?", "singleChoice", "personality", false, false, 250),
            Question("10000000-0000-0000-0000-000000000023", "boundary_topic", "Are there topics you prefer Arova to keep gentle?", "هل توجد مواضيع تفضل أن تتعامل معها Arova بلطف؟", "¿Hay temas que prefieres que Arova trate con suavidad?", "text", "boundaries", false, false, 260),
            Question("10000000-0000-0000-0000-000000000024", "surprise_preference", "Do you enjoy surprise prompts or predictable routines?", "هل تفضل الأسئلة المفاجئة أم الروتين المتوقع؟", "¿Prefieres sorpresas o rutinas predecibles?", "singleChoice", "personality", false, false, 270),
            Question("10000000-0000-0000-0000-000000000025", "memory_filters", "What memory filters would be useful later?", "ما مرشحات الذكريات التي ستكون مفيدة لاحقاً؟", "¿Qué filtros de recuerdos serían útiles más adelante?", "multiChoice", "preferences", false, false, 280),
            Question("10000000-0000-0000-0000-000000000026", "conversation_starters", "What kinds of conversation starters do you like?", "ما نوع بدايات الحديث التي تفضلها؟", "¿Qué tipos de temas para conversar te gustan?", "multiChoice", "communication", false, false, 290),
            Question("10000000-0000-0000-0000-000000000027", "care_reminders", "Would gentle care reminders be helpful?", "هل ستكون تذكيرات الاهتمام اللطيفة مفيدة؟", "¿Serían útiles los recordatorios amables de cuidado?", "singleChoice", "personalization", false, false, 300),
            Question("10000000-0000-0000-0000-000000000028", "future_milestones", "What future milestones would you like to remember?", "ما المحطات المستقبلية التي تريد تذكرها؟", "¿Qué metas futuras quisieras recordar?", "multiChoice", "future", false, false, 310),
            Question("10000000-0000-0000-0000-000000000029", "data_privacy_expectation", "What privacy expectations should Arova respect most?", "ما توقعات الخصوصية التي يجب أن تحترمها Arova أكثر؟", "¿Qué expectativas de privacidad debe respetar más Arova?", "multiChoice", "privacy", false, false, 320)
        ];
    }

    private static OnboardingQuestion Question(
        string id,
        string key,
        string textEn,
        string textAr,
        string textEs,
        string type,
        string category,
        bool isRequired,
        bool isQuickStart,
        int sortOrder)
    {
        return new OnboardingQuestion
        {
            Id = Guid.Parse(id),
            Key = key,
            TextEn = textEn,
            TextAr = textAr,
            TextEs = textEs,
            Type = type,
            Category = category,
            IsRequired = isRequired,
            IsQuickStart = isQuickStart,
            SortOrder = sortOrder,
            IsActive = true
        };
    }

    private static void ConfigurePlanetDefinition(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<PlanetDefinition>();
        entity.HasKey(p => p.Id);
        entity.Property(p => p.Key).HasMaxLength(80).IsRequired();
        entity.Property(p => p.Name).HasMaxLength(120).IsRequired();
        entity.Property(p => p.Description).HasMaxLength(1000);
        entity.Property(p => p.ThemeKey).HasMaxLength(80);
        entity.Property(p => p.Purpose).HasMaxLength(120);
        entity.Property(p => p.Difficulty).HasMaxLength(40);
        entity.Property(p => p.EstimatedMinutes).IsRequired();
        entity.Property(p => p.PointsReward).IsRequired();
        entity.Property(p => p.IsActive).IsRequired();
        entity.Property(p => p.SortOrder).IsRequired();
        entity.HasIndex(p => p.Key).IsUnique();

        entity.HasData(
            new PlanetDefinition { Id = Guid.Parse("8a8d16eb-8bfb-4d43-85bb-41fa9bf6b9b1"), Key = "mercury", Name = "Mercury", Description = "Deepen communication and understand each other's expressions.", ThemeKey = "mercury_theme", Purpose = "Communication", Difficulty = "Easy", EstimatedMinutes = 10, PointsReward = 20, IsActive = true, SortOrder = 1 },
            new PlanetDefinition { Id = Guid.Parse("f4bb42fd-5c02-4b2a-89a0-128a1c876b5b"), Key = "venus", Name = "Venus", Description = "Ignite romance, appreciation, and special mutual gestures.", ThemeKey = "venus_theme", Purpose = "Romance", Difficulty = "Medium", EstimatedMinutes = 15, PointsReward = 30, IsActive = true, SortOrder = 2 },
            new PlanetDefinition { Id = Guid.Parse("a98db25f-2a31-4db4-bb1f-36fa89c4ba22"), Key = "earth", Name = "Earth", Description = "Strengthen connection by recalling shared history.", ThemeKey = "earth_theme", Purpose = "Connection", Difficulty = "Easy", EstimatedMinutes = 12, PointsReward = 25, IsActive = true, SortOrder = 3 },
            new PlanetDefinition { Id = Guid.Parse("3dfa5611-cfcb-419b-aefb-b89a421c70e2"), Key = "mars", Name = "Mars", Description = "Foster passion, deeper expression, and intimate letters.", ThemeKey = "mars_theme", Purpose = "Passion", Difficulty = "Medium", EstimatedMinutes = 20, PointsReward = 40, IsActive = true, SortOrder = 4 },
            new PlanetDefinition { Id = Guid.Parse("5fba6a87-c10a-4dae-bcda-89710f22f7b1"), Key = "jupiter", Name = "Jupiter", Description = "Grow together by setting goals and reflecting on lessons.", ThemeKey = "jupiter_theme", Purpose = "Growth", Difficulty = "Hard", EstimatedMinutes = 30, PointsReward = 50, IsActive = true, SortOrder = 5 },
            new PlanetDefinition { Id = Guid.Parse("de123cba-45fa-42f1-aa8b-4fa8bba81234"), Key = "saturn", Name = "Saturn", Description = "Build long-term commitment, structure, and joint habits.", ThemeKey = "saturn_theme", Purpose = "Commitment", Difficulty = "Hard", EstimatedMinutes = 25, PointsReward = 45, IsActive = true, SortOrder = 6 },
            new PlanetDefinition { Id = Guid.Parse("47ba12ef-bc11-47fa-8ab2-da781cba9088"), Key = "uranus", Name = "Uranus", Description = "Embark on adventures, try new hobbies, and share laughs.", ThemeKey = "uranus_theme", Purpose = "Adventure", Difficulty = "Medium", EstimatedMinutes = 18, PointsReward = 35, IsActive = true, SortOrder = 7 },
            new PlanetDefinition { Id = Guid.Parse("ba12389a-f4ab-45bc-9abc-da81cdba0899"), Key = "neptune", Name = "Neptune", Description = "Explore dreams, share sleep patterns, and ambient music.", ThemeKey = "neptune_theme", Purpose = "Dreams", Difficulty = "Easy", EstimatedMinutes = 15, PointsReward = 30, IsActive = true, SortOrder = 8 },
            new PlanetDefinition { Id = Guid.Parse("deba0988-12ab-47bc-ba91-cdba08901abc"), Key = "pluto", Name = "Pluto", Description = "Unveil deepest vulnerabilities and craft secret memories.", ThemeKey = "pluto_theme", Purpose = "Depth", Difficulty = "Hard", EstimatedMinutes = 25, PointsReward = 45, IsActive = true, SortOrder = 9 },
            new PlanetDefinition { Id = Guid.Parse("12ba0911-34cd-4ef1-89ab-da710cba0999"), Key = "kepler", Name = "Kepler", Description = "Discover new ideas, ask daily questions, and check-in.", ThemeKey = "kepler_theme", Purpose = "Discovery", Difficulty = "Easy", EstimatedMinutes = 10, PointsReward = 25, IsActive = true, SortOrder = 10 }
        );
    }

    private static void ConfigurePlanetTaskDefinition(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<PlanetTaskDefinition>();
        entity.HasKey(t => t.Id);
        entity.Property(t => t.TaskKey).HasMaxLength(80).IsRequired();
        entity.Property(t => t.Title).HasMaxLength(120).IsRequired();
        entity.Property(t => t.Description).HasMaxLength(1000);
        entity.Property(t => t.PointsReward).IsRequired();
        entity.Property(t => t.IsRequired).IsRequired();
        entity.Property(t => t.SortOrder).IsRequired();
        entity.HasOne(t => t.PlanetDefinition).WithMany(p => p.Tasks).HasForeignKey(t => t.PlanetDefinitionId).OnDelete(DeleteBehavior.Cascade);
        entity.HasIndex(t => new { t.PlanetDefinitionId, t.TaskKey }).IsUnique();

        entity.HasData(
            // Mercury
            new PlanetTaskDefinition { Id = Guid.Parse("11111111-1111-1111-1111-111111111111"), PlanetDefinitionId = Guid.Parse("8a8d16eb-8bfb-4d43-85bb-41fa9bf6b9b1"), TaskKey = "mercury_task_1", Title = "Send a morning message", Description = "Start the day by saying hello to your partner.", PointsReward = 10, IsRequired = true, SortOrder = 1 },
            new PlanetTaskDefinition { Id = Guid.Parse("11111111-1111-1111-1111-111111111112"), PlanetDefinitionId = Guid.Parse("8a8d16eb-8bfb-4d43-85bb-41fa9bf6b9b1"), TaskKey = "mercury_task_2", Title = "Share one thing you appreciate", Description = "Tell your partner one small thing you appreciate today.", PointsReward = 10, IsRequired = true, SortOrder = 2 },
            new PlanetTaskDefinition { Id = Guid.Parse("11111111-1111-1111-1111-111111111113"), PlanetDefinitionId = Guid.Parse("8a8d16eb-8bfb-4d43-85bb-41fa9bf6b9b1"), TaskKey = "mercury_task_3", Title = "Check in on mood", Description = "Update your mood status.", PointsReward = 5, IsRequired = false, SortOrder = 3 },

            // Venus
            new PlanetTaskDefinition { Id = Guid.Parse("22222222-2222-2222-2222-222222222221"), PlanetDefinitionId = Guid.Parse("f4bb42fd-5c02-4b2a-89a0-128a1c876b5b"), TaskKey = "venus_task_1", Title = "Write a sweet reason", Description = "Write a reason why you love your partner.", PointsReward = 15, IsRequired = true, SortOrder = 1 },
            new PlanetTaskDefinition { Id = Guid.Parse("22222222-2222-2222-2222-222222222222"), PlanetDefinitionId = Guid.Parse("f4bb42fd-5c02-4b2a-89a0-128a1c876b5b"), TaskKey = "venus_task_2", Title = "Add a song you both love", Description = "Add a song to the shared playlist.", PointsReward = 10, IsRequired = true, SortOrder = 2 },
            new PlanetTaskDefinition { Id = Guid.Parse("22222222-2222-2222-2222-222222222223"), PlanetDefinitionId = Guid.Parse("f4bb42fd-5c02-4b2a-89a0-128a1c876b5b"), TaskKey = "venus_task_3", Title = "Send a cute emoji sequence", Description = "Send emojis that represent your day.", PointsReward = 5, IsRequired = false, SortOrder = 3 },

            // Earth
            new PlanetTaskDefinition { Id = Guid.Parse("33333333-3333-3333-3333-333333333331"), PlanetDefinitionId = Guid.Parse("a98db25f-2a31-4db4-bb1f-36fa89c4ba22"), TaskKey = "earth_task_1", Title = "Recall a favorite memory", Description = "Talk about a favorite memory you share.", PointsReward = 15, IsRequired = true, SortOrder = 1 },
            new PlanetTaskDefinition { Id = Guid.Parse("33333333-3333-3333-3333-333333333332"), PlanetDefinitionId = Guid.Parse("a98db25f-2a31-4db4-bb1f-36fa89c4ba22"), TaskKey = "earth_task_2", Title = "Plan a small date", Description = "Create a bucket list item for this weekend.", PointsReward = 10, IsRequired = true, SortOrder = 2 },
            new PlanetTaskDefinition { Id = Guid.Parse("33333333-3333-3333-3333-333333333333"), PlanetDefinitionId = Guid.Parse("a98db25f-2a31-4db4-bb1f-36fa89c4ba22"), TaskKey = "earth_task_3", Title = "Upload a couple photo", Description = "Upload a picture of the two of you.", PointsReward = 15, IsRequired = false, SortOrder = 3 },

            // Mars
            new PlanetTaskDefinition { Id = Guid.Parse("44444444-4444-4444-4444-444444444441"), PlanetDefinitionId = Guid.Parse("3dfa5611-cfcb-419b-aefb-b89a421c70e2"), TaskKey = "mars_task_1", Title = "Share a hidden dream", Description = "Tell your partner a dream you haven't shared before.", PointsReward = 20, IsRequired = true, SortOrder = 1 },
            new PlanetTaskDefinition { Id = Guid.Parse("44444444-4444-4444-4444-444444444442"), PlanetDefinitionId = Guid.Parse("3dfa5611-cfcb-419b-aefb-b89a421c70e2"), TaskKey = "mars_task_2", Title = "Write a longer letter", Description = "Write a digital letter reflecting on your bond.", PointsReward = 20, IsRequired = true, SortOrder = 2 },
            new PlanetTaskDefinition { Id = Guid.Parse("44444444-4444-4444-4444-444444444443"), PlanetDefinitionId = Guid.Parse("3dfa5611-cfcb-419b-aefb-b89a421c70e2"), TaskKey = "mars_task_3", Title = "Give a genuine compliment", Description = "Give your partner a sincere compliment.", PointsReward = 10, IsRequired = false, SortOrder = 3 },

            // Jupiter
            new PlanetTaskDefinition { Id = Guid.Parse("55555555-5555-5555-5555-555555555551"), PlanetDefinitionId = Guid.Parse("5fba6a87-c10a-4dae-bcda-89710f22f7b1"), TaskKey = "jupiter_task_1", Title = "Answer a deep question", Description = "Ask and answer a meaningful relationship question.", PointsReward = 25, IsRequired = true, SortOrder = 1 },
            new PlanetTaskDefinition { Id = Guid.Parse("55555555-5555-5555-5555-555555555552"), PlanetDefinitionId = Guid.Parse("5fba6a87-c10a-4dae-bcda-89710f22f7b1"), TaskKey = "jupiter_task_2", Title = "Set a joint goal", Description = "Write down a goal you want to achieve together.", PointsReward = 20, IsRequired = true, SortOrder = 2 },
            new PlanetTaskDefinition { Id = Guid.Parse("55555555-5555-5555-5555-555555555553"), PlanetDefinitionId = Guid.Parse("5fba6a87-c10a-4dae-bcda-89710f22f7b1"), TaskKey = "jupiter_task_3", Title = "Reflect on a challenge", Description = "Share how you both overcame a past challenge.", PointsReward = 20, IsRequired = false, SortOrder = 3 },

            // Saturn
            new PlanetTaskDefinition { Id = Guid.Parse("66666666-6666-6666-6666-666666666661"), PlanetDefinitionId = Guid.Parse("de123cba-45fa-42f1-aa8b-4fa8bba81234"), TaskKey = "saturn_task_1", Title = "Write a promise", Description = "Write a small promise or commitment to your partner.", PointsReward = 20, IsRequired = true, SortOrder = 1 },
            new PlanetTaskDefinition { Id = Guid.Parse("66666666-6666-6666-6666-666666666662"), PlanetDefinitionId = Guid.Parse("de123cba-45fa-42f1-aa8b-4fa8bba81234"), TaskKey = "saturn_task_2", Title = "Create a future memory date", Description = "Mark a calendar date for a future milestone.", PointsReward = 15, IsRequired = true, SortOrder = 2 },
            new PlanetTaskDefinition { Id = Guid.Parse("66666666-6666-6666-6666-666666666663"), PlanetDefinitionId = Guid.Parse("de123cba-45fa-42f1-aa8b-4fa8bba81234"), TaskKey = "saturn_task_3", Title = "Say thank you for support", Description = "Thank your partner for their support in tough times.", PointsReward = 15, IsRequired = false, SortOrder = 3 },

            // Uranus
            new PlanetTaskDefinition { Id = Guid.Parse("77777777-7777-7777-7777-777777777771"), PlanetDefinitionId = Guid.Parse("47ba12ef-bc11-47fa-8ab2-da781cba9088"), TaskKey = "uranus_task_1", Title = "Suggest a new hobby", Description = "Propose a new activity to try together.", PointsReward = 15, IsRequired = true, SortOrder = 1 },
            new PlanetTaskDefinition { Id = Guid.Parse("77777777-7777-7777-7777-777777777772"), PlanetDefinitionId = Guid.Parse("47ba12ef-bc11-47fa-8ab2-da781cba9088"), TaskKey = "uranus_task_2", Title = "Share a funny story", Description = "Tell your partner something that made you laugh.", PointsReward = 10, IsRequired = true, SortOrder = 2 },
            new PlanetTaskDefinition { Id = Guid.Parse("77777777-7777-7777-7777-777777777773"), PlanetDefinitionId = Guid.Parse("47ba12ef-bc11-47fa-8ab2-da781cba9088"), TaskKey = "uranus_task_3", Title = "Plan an imaginary trip", Description = "Describe your dream vacation destination.", PointsReward = 15, IsRequired = false, SortOrder = 3 },

            // Neptune
            new PlanetTaskDefinition { Id = Guid.Parse("88888888-8888-8888-8888-888888888881"), PlanetDefinitionId = Guid.Parse("ba12389a-f4ab-45bc-9abc-da81cdba0899"), TaskKey = "neptune_task_1", Title = "Share a night dream", Description = "Describe a recent dream you had while sleeping.", PointsReward = 10, IsRequired = true, SortOrder = 1 },
            new PlanetTaskDefinition { Id = Guid.Parse("88888888-8888-8888-8888-888888888882"), PlanetDefinitionId = Guid.Parse("ba12389a-f4ab-45bc-9abc-da81cdba0899"), TaskKey = "neptune_task_2", Title = "Write a fantasy scenario", Description = "Describe a fun fictional scenario for both of you.", PointsReward = 15, IsRequired = true, SortOrder = 2 },
            new PlanetTaskDefinition { Id = Guid.Parse("88888888-8888-8888-8888-888888888883"), PlanetDefinitionId = Guid.Parse("ba12389a-f4ab-45bc-9abc-da81cdba0899"), TaskKey = "neptune_task_3", Title = "Listen to ambient music", Description = "Recommend a relaxing track to listen to.", PointsReward = 10, IsRequired = false, SortOrder = 3 },

            // Pluto
            new PlanetTaskDefinition { Id = Guid.Parse("99999999-9999-9999-9999-999999999991"), PlanetDefinitionId = Guid.Parse("deba0988-12ab-47bc-ba91-cdba08901abc"), TaskKey = "pluto_task_1", Title = "Discuss a vulnerability", Description = "Share a small vulnerability or fear with your partner.", PointsReward = 25, IsRequired = true, SortOrder = 1 },
            new PlanetTaskDefinition { Id = Guid.Parse("99999999-9999-9999-9999-999999999992"), PlanetDefinitionId = Guid.Parse("deba0988-12ab-47bc-ba91-cdba08901abc"), TaskKey = "pluto_task_2", Title = "Express a deep gratitude", Description = "Thank your partner for their presence in your life.", PointsReward = 20, IsRequired = true, SortOrder = 2 },
            new PlanetTaskDefinition { Id = Guid.Parse("99999999-9999-9999-9999-999999999993"), PlanetDefinitionId = Guid.Parse("deba0988-12ab-47bc-ba91-cdba08901abc"), TaskKey = "pluto_task_3", Title = "Create a secret word", Description = "Come up with a private word or code just for you two.", PointsReward = 10, IsRequired = false, SortOrder = 3 },

            // Kepler
            new PlanetTaskDefinition { Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), PlanetDefinitionId = Guid.Parse("12ba0911-34cd-4ef1-89ab-da710cba0999"), TaskKey = "kepler_task_1", Title = "Share a new fact", Description = "Tell your partner an interesting fact you learned today.", PointsReward = 10, IsRequired = true, SortOrder = 1 },
            new PlanetTaskDefinition { Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab"), PlanetDefinitionId = Guid.Parse("12ba0911-34cd-4ef1-89ab-da710cba0999"), TaskKey = "kepler_task_2", Title = "Ask about their day", Description = "Ask a detailed question about their day.", PointsReward = 10, IsRequired = true, SortOrder = 2 },
            new PlanetTaskDefinition { Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac"), PlanetDefinitionId = Guid.Parse("12ba0911-34cd-4ef1-89ab-da710cba0999"), TaskKey = "kepler_task_3", Title = "Send a custom check-in", Description = "Send a message checking in on how they are feeling right now.", PointsReward = 10, IsRequired = false, SortOrder = 3 }
        );
    }

    private static void ConfigureDailyCouplePlanet(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<DailyCouplePlanet>();
        entity.HasKey(d => d.Id);
        entity.Property(d => d.Date).IsRequired();
        entity.Property(d => d.CreatedAt).IsRequired();
        entity.HasOne(d => d.Couple).WithMany().HasForeignKey(d => d.CoupleId).OnDelete(DeleteBehavior.Restrict);
        entity.HasOne(d => d.PlanetDefinition).WithMany(p => p.DailyAssignments).HasForeignKey(d => d.PlanetDefinitionId).OnDelete(DeleteBehavior.Restrict);
        entity.HasIndex(d => new { d.CoupleId, d.Date }).IsUnique();
    }

    private static void ConfigureDailyPlanetTaskCompletion(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<DailyPlanetTaskCompletion>();
        entity.HasKey(c => c.Id);
        entity.Property(c => c.TaskKey).HasMaxLength(80).IsRequired();
        entity.Property(c => c.PointsAwarded).IsRequired();
        entity.Property(c => c.CompletedAt).IsRequired();
        entity.HasOne(c => c.DailyCouplePlanet).WithMany(d => d.TaskCompletions).HasForeignKey(c => c.DailyCouplePlanetId).OnDelete(DeleteBehavior.Cascade);
        entity.HasOne(c => c.User).WithMany().HasForeignKey(c => c.UserId).OnDelete(DeleteBehavior.Restrict);
        entity.HasIndex(c => new { c.DailyCouplePlanetId, c.UserId, c.TaskKey }).IsUnique();
    }

    private static void ConfigureRelationshipPointLedger(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<RelationshipPointLedger>();
        entity.HasKey(r => r.Id);
        entity.Property(r => r.ActionType).HasMaxLength(80).IsRequired();
        entity.Property(r => r.Points).IsRequired();
        entity.Property(r => r.Reason).HasMaxLength(500).IsRequired();
        entity.Property(r => r.SourceType).HasMaxLength(80);
        entity.Property(r => r.CreatedAt).IsRequired();
        entity.HasOne(r => r.Couple).WithMany().HasForeignKey(r => r.CoupleId).OnDelete(DeleteBehavior.Restrict);
        entity.HasOne(r => r.User).WithMany().HasForeignKey(r => r.UserId).OnDelete(DeleteBehavior.Restrict);
        entity.HasIndex(r => r.CoupleId);
        entity.HasIndex(r => r.CreatedAt);
    }

    private static void ConfigureRelationshipDailyTask(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<RelationshipDailyTask>();
        entity.HasKey(r => r.Id);
        entity.Property(r => r.TaskKey).HasMaxLength(80).IsRequired();
        entity.Property(r => r.Title).HasMaxLength(120).IsRequired();
        entity.Property(r => r.Description).HasMaxLength(1000).IsRequired();
        entity.Property(r => r.PointsReward).IsRequired();
        entity.Property(r => r.Date).IsRequired();
        entity.Property(r => r.IsCompleted).IsRequired();
        entity.Property(r => r.CompletedAt);
        entity.Property(r => r.CreatedAt).IsRequired();
        entity.HasOne(r => r.Couple).WithMany().HasForeignKey(r => r.CoupleId).OnDelete(DeleteBehavior.Restrict);
        entity.HasOne(r => r.CompletedByUser).WithMany().HasForeignKey(r => r.CompletedByUserId).OnDelete(DeleteBehavior.Restrict);
        entity.HasIndex(r => new { r.CoupleId, r.Date, r.TaskKey }).IsUnique();
    }

    private static void ConfigureCustomSection(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<CustomSection>();
        entity.HasKey(c => c.Id);
        entity.Property(c => c.Title).HasMaxLength(200).IsRequired();
        entity.Property(c => c.Description).HasMaxLength(1000);
        entity.Property(c => c.Icon).HasMaxLength(80);
        entity.Property(c => c.VisibilityLevel).IsRequired();
        entity.Property(c => c.CreatedAt).IsRequired();
        entity.Property(c => c.UpdatedAt);
        ConfigureCoupleAndCreatorRelationships(entity, cs => cs.Couple, null, cs => cs.CoupleId, cs => cs.CreatedByUser, null, cs => cs.CreatedByUserId);
    }

    private static void ConfigureCustomSectionItem(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<CustomSectionItem>();
        entity.HasKey(c => c.Id);
        entity.Property(c => c.Text).HasMaxLength(500).IsRequired();
        entity.Property(c => c.IsCompleted).IsRequired();
        entity.Property(c => c.SortOrder).IsRequired();
        entity.Property(c => c.CreatedAt).IsRequired();
        entity.Property(c => c.UpdatedAt);
        entity.HasOne(c => c.CustomSection).WithMany(s => s.Items).HasForeignKey(c => c.CustomSectionId).OnDelete(DeleteBehavior.Cascade);
    }

    private static void ConfigureCoupleAndCreatorRelationships<TEntity>(
        Microsoft.EntityFrameworkCore.Metadata.Builders.EntityTypeBuilder<TEntity> entity,
        System.Linq.Expressions.Expression<Func<TEntity, Couple?>> coupleNavigation,
        System.Linq.Expressions.Expression<Func<Couple, IEnumerable<TEntity>?>> coupleCollection,
        System.Linq.Expressions.Expression<Func<TEntity, object?>> coupleId,
        System.Linq.Expressions.Expression<Func<TEntity, AppUser?>> creatorNavigation,
        System.Linq.Expressions.Expression<Func<AppUser, IEnumerable<TEntity>?>> creatorCollection,
        System.Linq.Expressions.Expression<Func<TEntity, object?>> createdByUserId)
        where TEntity : class
    {
        entity
            .HasOne(coupleNavigation)
            .WithMany(coupleCollection)
            .HasForeignKey(coupleId)
            .OnDelete(DeleteBehavior.Restrict);

        entity
            .HasOne(creatorNavigation)
            .WithMany(creatorCollection)
            .HasForeignKey(createdByUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private static void ConfigureDailyQuestion(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<DailyQuestion>();

        entity.HasKey(dq => dq.Id);
        entity.Property(dq => dq.Prompt).HasMaxLength(2000).IsRequired();
        entity.Property(dq => dq.Category).HasMaxLength(200).IsRequired();
        entity.Property(dq => dq.IsActive).IsRequired();
        entity.Property(dq => dq.CreatedAt).IsRequired();

        entity.HasIndex(dq => dq.CoupleId);
        entity.HasIndex(dq => dq.CreatedAt);

        entity
            .HasOne(dq => dq.Couple)
            .WithMany()
            .HasForeignKey(dq => dq.CoupleId)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private static void ConfigureDailyQuestionAnswer(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<DailyQuestionAnswer>();

        entity.HasKey(dqa => dqa.Id);
        entity.Property(dqa => dqa.Answer).HasMaxLength(4000).IsRequired();
        entity.Property(dqa => dqa.CreatedAt).IsRequired();

        entity.HasIndex(dqa => dqa.CoupleId);
        entity.HasIndex(dqa => dqa.QuestionId);
        entity.HasIndex(dqa => dqa.UserId);
        entity.HasIndex(dqa => new { dqa.CoupleId, dqa.QuestionId, dqa.UserId }).IsUnique();

        entity
            .HasOne(dqa => dqa.Couple)
            .WithMany()
            .HasForeignKey(dqa => dqa.CoupleId)
            .OnDelete(DeleteBehavior.Restrict);

        entity
            .HasOne(dqa => dqa.Question)
            .WithMany(dq => dq.Answers)
            .HasForeignKey(dqa => dqa.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);

        entity
            .HasOne(dqa => dqa.User)
            .WithMany()
            .HasForeignKey(dqa => dqa.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private static void ConfigureCheckIn(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<CheckIn>();

        entity.HasKey(c => c.Id);
        entity.Property(c => c.Mood).IsRequired();
        entity.Property(c => c.Energy).IsRequired();
        entity.Property(c => c.Need).IsRequired();
        entity.Property(c => c.Note).HasMaxLength(1000);
        entity.Property(c => c.CreatedAt).IsRequired();

        entity.HasIndex(c => c.CoupleId);
        entity.HasIndex(c => c.UserId);
        entity.HasIndex(c => c.CreatedAt);

        entity
            .HasOne(c => c.Couple)
            .WithMany()
            .HasForeignKey(c => c.CoupleId)
            .OnDelete(DeleteBehavior.Restrict);

        entity
            .HasOne(c => c.User)
            .WithMany()
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private static void ConfigureImportantDate(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<ImportantDate>();

        entity.HasKey(d => d.Id);
        entity.Property(d => d.Title).HasMaxLength(160).IsRequired();
        entity.Property(d => d.Description).HasMaxLength(1000);
        entity.Property(d => d.Type).HasMaxLength(50).IsRequired();
        entity.Property(d => d.Recurrence).HasMaxLength(50).IsRequired();
        entity.Property(d => d.ReminderEnabled).IsRequired();
        entity.Property(d => d.ReminderDaysBefore).IsRequired();
        entity.Property(d => d.IsPrivate).IsRequired();
        entity.Property(d => d.CreatedAt).IsRequired();

        entity.HasIndex(d => d.CoupleId);
        entity.HasIndex(d => d.CreatedByUserId);

        entity
            .HasOne(d => d.Couple)
            .WithMany()
            .HasForeignKey(d => d.CoupleId)
            .OnDelete(DeleteBehavior.Cascade);

        entity
            .HasOne(d => d.CreatedByUser)
            .WithMany()
            .HasForeignKey(d => d.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private static void ConfigureCoupleGoal(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<CoupleGoal>();

        entity.HasKey(g => g.Id);
        entity.Property(g => g.Title).HasMaxLength(200).IsRequired();
        entity.Property(g => g.Description).HasMaxLength(1000);
        entity.Property(g => g.Category).HasMaxLength(50).IsRequired();
        entity.Property(g => g.Status).HasMaxLength(50).IsRequired();
        entity.Property(g => g.ProgressPercent).IsRequired();
        entity.Property(g => g.IsPrivate).IsRequired();
        entity.Property(g => g.CreatedAt).IsRequired();

        entity.HasIndex(g => g.CoupleId);
        entity.HasIndex(g => g.CreatedByUserId);

        ConfigureCoupleAndCreatorRelationships(
            entity,
            g => g.Couple,
            null,
            g => g.CoupleId,
            g => g.CreatedByUser,
            null,
            g => g.CreatedByUserId);
    }

    private static void ConfigureCoupleGoalMilestone(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<CoupleGoalMilestone>();

        entity.HasKey(m => m.Id);
        entity.Property(m => m.Title).HasMaxLength(200).IsRequired();
        entity.Property(m => m.IsCompleted).IsRequired();
        entity.Property(m => m.CreatedAt).IsRequired();

        entity.HasIndex(m => m.GoalId);

        entity
            .HasOne(m => m.Goal)
            .WithMany(g => g.Milestones)
            .HasForeignKey(m => m.GoalId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
