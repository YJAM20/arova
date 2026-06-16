using LoveUniverse.Api.Data;
using LoveUniverse.Api.DTOs.Backup;
using LoveUniverse.Api.DTOs.Chat;
using LoveUniverse.Api.Entities;
using LoveUniverse.Api.Entities.Enums;
using Microsoft.EntityFrameworkCore;

namespace LoveUniverse.Api.Services;

public sealed class BackupService : IBackupService
{
    private const int MaxImportItems = 1000;

    private readonly AppDbContext _dbContext;
    private readonly IPermissionService _permissionService;
    private readonly IMemoryService _memoryService;
    private readonly IReasonService _reasonService;
    private readonly ILetterService _letterService;
    private readonly IMoodService _moodService;
    private readonly ISongService _songService;
    private readonly IChallengeService _challengeService;
    private readonly IFuturePlanService _futurePlanService;
    private readonly ISettingsService _settingsService;

    public BackupService(
        AppDbContext dbContext,
        IPermissionService permissionService,
        IMemoryService memoryService,
        IReasonService reasonService,
        ILetterService letterService,
        IMoodService moodService,
        ISongService songService,
        IChallengeService challengeService,
        IFuturePlanService futurePlanService,
        ISettingsService settingsService)
    {
        _dbContext = dbContext;
        _permissionService = permissionService;
        _memoryService = memoryService;
        _reasonService = reasonService;
        _letterService = letterService;
        _moodService = moodService;
        _songService = songService;
        _challengeService = challengeService;
        _futurePlanService = futurePlanService;
        _settingsService = settingsService;
    }

    public async Task<ContentServiceResult<BackupExportResponse>> ExportAsync(CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<BackupExportResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var memories = await _memoryService.GetMemoriesAsync(cancellationToken);
        var reasons = await _reasonService.GetReasonsAsync(cancellationToken);
        var letters = await _letterService.GetLettersAsync(cancellationToken);
        var moods = await _moodService.GetMoodsAsync(cancellationToken);
        var songs = await _songService.GetSongsAsync(cancellationToken);
        var challenges = await _challengeService.GetChallengesAsync(cancellationToken);
        var futurePlans = await _futurePlanService.GetFuturePlansAsync(cancellationToken);
        var settings = await _settingsService.GetSettingsAsync(cancellationToken);
        var chatMessages = await GetAllChatMessagesForBackupAsync(context.CoupleId!.Value, cancellationToken);

        var failure = FirstFailure(
            memories.Status,
            reasons.Status,
            letters.Status,
            moods.Status,
            songs.Status,
            challenges.Status,
            futurePlans.Status,
            settings.Status);

        if (failure is not null)
        {
            return ContentServiceResult<BackupExportResponse>.Failure(failure.Value, "Backup export could not be completed.");
        }

        return ContentServiceResult<BackupExportResponse>.Success(new BackupExportResponse
        {
            BackupVersion = "1.0",
            ExportedAtUtc = DateTime.UtcNow,
            CoupleId = context.CoupleId!.Value,
            Memories = memories.Value ?? [],
            Reasons = reasons.Value ?? [],
            Letters = letters.Value ?? [],
            MoodEntries = moods.Value ?? [],
            Songs = songs.Value ?? [],
            Challenges = challenges.Value ?? [],
            FuturePlans = futurePlans.Value ?? [],
            ChatMessages = chatMessages,
            Settings = settings.Value
        });
    }

    public async Task<ContentServiceResult<string>> ImportAsync(
        BackupImportRequest request,
        CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<string>.Failure(context.Status, context.ErrorMessage);
        }

        var memories = request.Memories ?? [];
        var reasons = request.Reasons ?? [];
        var letters = request.Letters ?? [];
        var moodEntries = request.MoodEntries ?? [];
        var songs = request.Songs ?? [];
        var challenges = request.Challenges ?? [];
        var futurePlans = request.FuturePlans ?? [];
        var chatMessages = request.ChatMessages ?? [];

        var totalItems =
            memories.Count
            + reasons.Count
            + letters.Count
            + moodEntries.Count
            + songs.Count
            + challenges.Count
            + futurePlans.Count
            + chatMessages.Count;

        if (totalItems > MaxImportItems)
        {
            return ContentServiceResult<string>.Failure(ContentServiceStatus.BadRequest, "Backup import is limited to 1000 items at a time.");
        }

        var now = DateTime.UtcNow;
        var userId = context.UserId!.Value;
        var coupleId = context.CoupleId!.Value;

        foreach (var item in memories)
        {
            if (item is null)
            {
                return ContentServiceResult<string>.Failure(ContentServiceStatus.BadRequest, "Imported memories cannot contain empty items.");
            }

            var title = CleanRequired(item.Title, "Memory title");
            if (title is null)
            {
                return ContentServiceResult<string>.Failure(ContentServiceStatus.BadRequest, "Every imported memory needs a title.");
            }

            _dbContext.Memories.Add(new Memory
            {
                Id = Guid.NewGuid(),
                CoupleId = coupleId,
                CreatedByUserId = userId,
                Title = title,
                Description = CleanOptional(item.Description),
                PrivateNote = CleanOptional(item.PrivateNote),
                MemoryDate = item.MemoryDate,
                Location = CleanOptional(item.Location),
                MediaUrl = CleanOptional(item.MediaUrl),
                VisibilityLevel = item.VisibilityLevel,
                CreatedAt = now
            });
        }

        foreach (var item in reasons)
        {
            if (item is null)
            {
                return ContentServiceResult<string>.Failure(ContentServiceStatus.BadRequest, "Imported reasons cannot contain empty items.");
            }

            var text = CleanRequired(item.Text, "Reason text");
            if (text is null)
            {
                return ContentServiceResult<string>.Failure(ContentServiceStatus.BadRequest, "Every imported reason needs text.");
            }

            _dbContext.Reasons.Add(new Reason
            {
                Id = Guid.NewGuid(),
                CoupleId = coupleId,
                CreatedByUserId = userId,
                Text = text,
                VisibilityLevel = item.VisibilityLevel,
                UnlockDate = item.UnlockDate,
                CreatedAt = now
            });
        }

        foreach (var item in letters)
        {
            if (item is null)
            {
                return ContentServiceResult<string>.Failure(ContentServiceStatus.BadRequest, "Imported letters cannot contain empty items.");
            }

            var title = CleanRequired(item.Title, "Letter title");
            var body = CleanRequired(item.Body, "Letter body");
            if (title is null || body is null)
            {
                return ContentServiceResult<string>.Failure(ContentServiceStatus.BadRequest, "Every imported letter needs a title and body.");
            }

            _dbContext.Letters.Add(new Letter
            {
                Id = Guid.NewGuid(),
                CoupleId = coupleId,
                CreatedByUserId = userId,
                Title = title,
                Body = body,
                VisibilityLevel = item.VisibilityLevel,
                OpenOnUtc = item.OpenOnUtc,
                IsLocked = item.IsLocked,
                PasscodeHash = null,
                CreatedAt = now
            });
        }

        var existingMoodDates = await _dbContext.MoodEntries
            .AsNoTracking()
            .Where(mood => mood.CoupleId == coupleId && mood.UserId == userId)
            .Select(mood => mood.EntryDate)
            .ToListAsync(cancellationToken);
        var usedMoodDates = existingMoodDates.ToHashSet();

        foreach (var item in moodEntries)
        {
            if (item is null)
            {
                return ContentServiceResult<string>.Failure(ContentServiceStatus.BadRequest, "Imported mood entries cannot contain empty items.");
            }

            if (item.MoodValue is < 1 or > 10)
            {
                return ContentServiceResult<string>.Failure(ContentServiceStatus.BadRequest, "Imported mood values must be between 1 and 10.");
            }

            var entryDate = item.EntryDate ?? DateOnly.FromDateTime(now);
            if (!usedMoodDates.Add(entryDate))
            {
                continue;
            }

            _dbContext.MoodEntries.Add(new MoodEntry
            {
                Id = Guid.NewGuid(),
                CoupleId = coupleId,
                UserId = userId,
                EntryDate = entryDate,
                MoodValue = item.MoodValue,
                Note = CleanOptional(item.Note),
                CreatedAt = now
            });
        }

        foreach (var item in songs)
        {
            if (item is null)
            {
                return ContentServiceResult<string>.Failure(ContentServiceStatus.BadRequest, "Imported songs cannot contain empty items.");
            }

            var title = CleanRequired(item.Title, "Song title");
            if (title is null)
            {
                return ContentServiceResult<string>.Failure(ContentServiceStatus.BadRequest, "Every imported song needs a title.");
            }

            _dbContext.Songs.Add(new Song
            {
                Id = Guid.NewGuid(),
                CoupleId = coupleId,
                CreatedByUserId = userId,
                Title = title,
                Artist = CleanOptional(item.Artist),
                AudioUrl = CleanOptional(item.AudioUrl),
                CoverUrl = CleanOptional(item.CoverUrl),
                ExternalUrl = CleanOptional(item.SourceUrl),
                License = CleanOptional(item.License),
                Attribution = CleanOptional(item.Attribution),
                Notes = CleanOptional(item.Notes),
                VisibilityLevel = item.VisibilityLevel,
                CreatedAt = now
            });
        }

        foreach (var item in challenges)
        {
            if (item is null)
            {
                return ContentServiceResult<string>.Failure(ContentServiceStatus.BadRequest, "Imported challenges cannot contain empty items.");
            }

            var title = CleanRequired(item.Title, "Challenge title");
            if (title is null)
            {
                return ContentServiceResult<string>.Failure(ContentServiceStatus.BadRequest, "Every imported challenge needs a title.");
            }

            if (item.StartsAt.HasValue && item.EndsAt.HasValue && item.StartsAt.Value > item.EndsAt.Value)
            {
                return ContentServiceResult<string>.Failure(ContentServiceStatus.BadRequest, "Challenge start time must be before the end time.");
            }

            _dbContext.Challenges.Add(new Challenge
            {
                Id = Guid.NewGuid(),
                CoupleId = coupleId,
                CreatedByUserId = userId,
                Title = title,
                Description = CleanOptional(item.Description),
                StartsAt = item.StartsAt,
                EndsAt = item.EndsAt,
                CreatedAt = now
            });
        }

        foreach (var item in futurePlans)
        {
            if (item is null)
            {
                return ContentServiceResult<string>.Failure(ContentServiceStatus.BadRequest, "Imported future plans cannot contain empty items.");
            }

            var title = CleanRequired(item.Title, "Future plan title");
            if (title is null)
            {
                return ContentServiceResult<string>.Failure(ContentServiceStatus.BadRequest, "Every imported future plan needs a title.");
            }

            _dbContext.FuturePlans.Add(new FuturePlan
            {
                Id = Guid.NewGuid(),
                CoupleId = coupleId,
                CreatedByUserId = userId,
                Title = title,
                Description = CleanOptional(item.Description),
                PlannedFor = item.PlannedFor,
                VisibilityLevel = item.VisibilityLevel,
                CreatedAt = now
            });
        }

        foreach (var item in chatMessages)
        {
            if (item is null)
            {
                return ContentServiceResult<string>.Failure(ContentServiceStatus.BadRequest, "Imported chat messages cannot contain empty items.");
            }

            var message = CleanRequired(item.Message, "Chat message");
            if (message is null)
            {
                return ContentServiceResult<string>.Failure(ContentServiceStatus.BadRequest, "Every imported chat message needs text.");
            }

            _dbContext.ChatMessages.Add(new ChatMessage
            {
                Id = Guid.NewGuid(),
                CoupleId = coupleId,
                UserId = userId,
                MessageType = item.MessageType,
                Message = message,
                AttachmentUrl = CleanOptional(item.AttachmentUrl),
                AttachmentMimeType = CleanOptional(item.AttachmentMimeType),
                AttachmentSizeBytes = item.AttachmentSizeBytes,
                EncryptionMode = CleanOptional(item.EncryptionMode) ?? "None",
                EncryptedPayload = CleanOptional(item.EncryptedPayload),
                Nonce = CleanOptional(item.Nonce),
                KeyId = CleanOptional(item.KeyId),
                SentAt = item.SentAt ?? now,
                CreatedAt = now
            });
        }

        var settingsSkipped = false;

        if (request.Settings is not null)
        {
            if (context.Role != CoupleRole.Owner)
            {
                settingsSkipped = true;
            }
            else
            {
                var settings = await _dbContext.CoupleSettings
                    .FirstOrDefaultAsync(candidate => candidate.CoupleId == coupleId, cancellationToken);

                if (settings is null)
                {
                    settings = new CoupleSettings
                    {
                        Id = Guid.NewGuid(),
                        CoupleId = coupleId,
                        CreatedAt = now
                    };
                    _dbContext.CoupleSettings.Add(settings);
                }

                settings.TimeZone = CleanRequired(request.Settings.TimeZone, "Time zone") ?? "UTC";
                settings.DailyReasonsEnabled = request.Settings.DailyReasonsEnabled;
                settings.MoodTrackingEnabled = request.Settings.MoodTrackingEnabled;
                settings.PrivateByDefault = request.Settings.PrivateByDefault;
                settings.ActiveTheme = CleanRequired(request.Settings.ActiveTheme, "Theme") ?? "default";
                settings.LanguageMode = CleanRequired(request.Settings.LanguageMode, "Language mode") ?? "en";
                settings.AnimationsEnabled = request.Settings.AnimationsEnabled;
                settings.MusicEnabled = request.Settings.MusicEnabled;
                settings.UpdatedAt = now;
            }
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        var resultMessage = settingsSkipped
            ? "Backup imported. Settings were skipped because only the owner can import couple settings."
            : "Backup imported.";

        return ContentServiceResult<string>.Success(resultMessage);
    }

    private async Task<AccessContext> GetAccessContextAsync(CancellationToken cancellationToken)
    {
        var userId = _permissionService.GetCurrentUserId();
        if (userId is null)
        {
            return AccessContext.Failure(ContentServiceStatus.Unauthorized, "Please sign in to continue.");
        }

        var coupleId = await _permissionService.GetCurrentUserCoupleIdAsync(cancellationToken);
        var role = await _permissionService.GetCurrentUserRoleAsync(cancellationToken);
        if (coupleId is null || role is null)
        {
            return AccessContext.Failure(ContentServiceStatus.NotFound, "Create or join a couple space first.");
        }

        return AccessContext.Success(userId.Value, coupleId.Value, role.Value);
    }

    private static ContentServiceStatus? FirstFailure(params ContentServiceStatus[] statuses)
    {
        return statuses.FirstOrDefault(status => status != ContentServiceStatus.Success) is var status
            && status != ContentServiceStatus.Success
                ? status
                : null;
    }

    private async Task<IReadOnlyList<ChatMessageResponse>> GetAllChatMessagesForBackupAsync(
        Guid coupleId,
        CancellationToken cancellationToken)
    {
        var messages = await _dbContext.ChatMessages
            .AsNoTracking()
            .Include(message => message.User)
            .Where(message => message.CoupleId == coupleId)
            .OrderBy(message => message.SentAt)
            .ToListAsync(cancellationToken);

        return messages
            .Select(message => new ChatMessageResponse
            {
                Id = message.Id,
                UserId = message.UserId,
                UserDisplayName = message.User.DisplayName ?? message.User.Username,
                MessageType = message.MessageType,
                Message = message.Message,
                AttachmentUrl = message.AttachmentUrl,
                AttachmentMimeType = message.AttachmentMimeType,
                AttachmentSizeBytes = message.AttachmentSizeBytes,
                EncryptionMode = message.EncryptionMode,
                EncryptedPayload = message.EncryptedPayload,
                Nonce = message.Nonce,
                KeyId = message.KeyId,
                SentAt = message.SentAt,
                CreatedAt = message.CreatedAt
            })
            .ToList();
    }

    private static string? CleanRequired(string? value, string _)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private static string? CleanOptional(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private sealed record AccessContext(
        bool Succeeded,
        Guid? UserId,
        Guid? CoupleId,
        CoupleRole? Role,
        ContentServiceStatus Status,
        string ErrorMessage)
    {
        public static AccessContext Success(Guid userId, Guid coupleId, CoupleRole role)
        {
            return new AccessContext(true, userId, coupleId, role, ContentServiceStatus.Success, string.Empty);
        }

        public static AccessContext Failure(ContentServiceStatus status, string errorMessage)
        {
            return new AccessContext(false, null, null, null, status, errorMessage);
        }
    }
}
