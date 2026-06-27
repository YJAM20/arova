using LoveUniverse.Api.Data;
using LoveUniverse.Api.DTOs.ImportantDates;
using LoveUniverse.Api.Entities;
using LoveUniverse.Api.Entities.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace LoveUniverse.Api.Services;

public sealed class ImportantDateService : IImportantDateService
{
    private readonly AppDbContext _dbContext;
    private readonly IPermissionService _permissionService;
    private readonly IEmailSender _emailSender;
    private readonly ILogger<ImportantDateService> _logger;

    public ImportantDateService(
        AppDbContext dbContext,
        IPermissionService permissionService,
        IEmailSender emailSender,
        ILogger<ImportantDateService> logger)
    {
        _dbContext = dbContext;
        _permissionService = permissionService;
        _emailSender = emailSender;
        _logger = logger;
    }

    public async Task<ContentServiceResult<IReadOnlyList<ImportantDateResponse>>> GetVisibleDatesAsync(CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<IReadOnlyList<ImportantDateResponse>>.Failure(context.Status, context.ErrorMessage);
        }

        var dates = await GetVisibleDatesInternalAsync(context.CoupleId!.Value, context.UserId!.Value, cancellationToken);
        var response = dates.Select(MapToResponse).OrderBy(d => d.NextOccurrenceDate).ToList();

        return ContentServiceResult<IReadOnlyList<ImportantDateResponse>>.Success(response);
    }

    public async Task<ContentServiceResult<IReadOnlyList<ImportantDateResponse>>> GetUpcomingDatesAsync(CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<IReadOnlyList<ImportantDateResponse>>.Failure(context.Status, context.ErrorMessage);
        }

        var dates = await GetVisibleDatesInternalAsync(context.CoupleId!.Value, context.UserId!.Value, cancellationToken);
        
        var today = DateTime.UtcNow.Date;
        var response = dates
            .Select(MapToResponse)
            .Where(r => r.DaysRemaining >= 0 && (r.Recurrence != "none" || r.Date.Date >= today))
            .OrderBy(r => r.DaysRemaining)
            .ToList();

        return ContentServiceResult<IReadOnlyList<ImportantDateResponse>>.Success(response);
    }

    public async Task<ContentServiceResult<ImportantDateResponse>> GetDateByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<ImportantDateResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var date = await _dbContext.ImportantDates
            .FirstOrDefaultAsync(d => d.Id == id && d.CoupleId == context.CoupleId, cancellationToken);

        if (date is null)
        {
            return ContentServiceResult<ImportantDateResponse>.Failure(ContentServiceStatus.NotFound, "Important date not found.");
        }

        if (date.IsPrivate && date.CreatedByUserId != context.UserId)
        {
            return ContentServiceResult<ImportantDateResponse>.Failure(ContentServiceStatus.Forbidden, "You do not have access to this private important date.");
        }

        return ContentServiceResult<ImportantDateResponse>.Success(MapToResponse(date));
    }

    public async Task<ContentServiceResult<ImportantDateResponse>> CreateDateAsync(ImportantDateCreateRequest request, CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<ImportantDateResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var importantDate = new ImportantDate
        {
            Id = Guid.NewGuid(),
            CoupleId = context.CoupleId!.Value,
            CreatedByUserId = context.UserId!.Value,
            Title = request.Title.Trim(),
            Description = request.Description?.Trim(),
            Date = request.Date.Date,
            Type = request.Type.ToLowerInvariant().Trim(),
            Recurrence = request.Recurrence.ToLowerInvariant().Trim(),
            ReminderEnabled = request.ReminderEnabled,
            ReminderDaysBefore = request.ReminderDaysBefore,
            IsPrivate = request.IsPrivate,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.ImportantDates.Add(importantDate);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return ContentServiceResult<ImportantDateResponse>.Success(MapToResponse(importantDate));
    }

    public async Task<ContentServiceResult<ImportantDateResponse>> UpdateDateAsync(Guid id, ImportantDateUpdateRequest request, CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<ImportantDateResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var date = await _dbContext.ImportantDates
            .FirstOrDefaultAsync(d => d.Id == id && d.CoupleId == context.CoupleId, cancellationToken);

        if (date is null)
        {
            return ContentServiceResult<ImportantDateResponse>.Failure(ContentServiceStatus.NotFound, "Important date not found.");
        }

        // Verify creator permission for private dates
        if (date.IsPrivate && date.CreatedByUserId != context.UserId)
        {
            return ContentServiceResult<ImportantDateResponse>.Failure(ContentServiceStatus.Forbidden, "Only the creator can edit private important dates.");
        }

        date.Title = request.Title.Trim();
        date.Description = request.Description?.Trim();
        date.Date = request.Date.Date;
        date.Type = request.Type.ToLowerInvariant().Trim();
        date.Recurrence = request.Recurrence.ToLowerInvariant().Trim();
        date.ReminderEnabled = request.ReminderEnabled;
        date.ReminderDaysBefore = request.ReminderDaysBefore;
        date.IsPrivate = request.IsPrivate;
        date.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return ContentServiceResult<ImportantDateResponse>.Success(MapToResponse(date));
    }

    public async Task<ContentServiceResult<bool>> DeleteDateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<bool>.Failure(context.Status, context.ErrorMessage);
        }

        var date = await _dbContext.ImportantDates
            .FirstOrDefaultAsync(d => d.Id == id && d.CoupleId == context.CoupleId, cancellationToken);

        if (date is null)
        {
            return ContentServiceResult<bool>.Failure(ContentServiceStatus.NotFound, "Important date not found.");
        }

        // Verify creator permission for private dates
        if (date.IsPrivate && date.CreatedByUserId != context.UserId)
        {
            return ContentServiceResult<bool>.Failure(ContentServiceStatus.Forbidden, "Only the creator can delete private important dates.");
        }

        _dbContext.ImportantDates.Remove(date);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return ContentServiceResult<bool>.Success(true);
    }

    public async Task<int> SendReminderEmailsAsync(CancellationToken cancellationToken = default)
    {
        var couples = await _dbContext.Couples
            .Include(c => c.Settings)
            .Include(c => c.Members)
                .ThenInclude(m => m.User)
            .Where(c => c.IsActive && c.Settings != null && c.Settings.EmailNotificationsEnabled)
            .ToListAsync(cancellationToken);

        int reminderSentCount = 0;
        var today = DateTime.UtcNow.Date;

        foreach (var couple in couples)
        {
            var dates = await _dbContext.ImportantDates
                .Where(d => d.CoupleId == couple.Id && d.ReminderEnabled)
                .ToListAsync(cancellationToken);

            foreach (var date in dates)
            {
                var nextOccur = CalculateNextOccurrence(date.Date, date.Recurrence);
                var daysRemaining = (nextOccur - today).Days;

                if (daysRemaining == date.ReminderDaysBefore)
                {
                    var members = couple.Members.Where(m => m.IsActive && m.User != null && m.User.IsActive && !string.IsNullOrWhiteSpace(m.User.Email)).ToList();

                    foreach (var member in members)
                      {
                        var user = member.User;

                        if (date.IsPrivate && date.CreatedByUserId != user.Id)
                        {
                            continue;
                        }

                        var displayName = user.DisplayName ?? user.Username;
                        var subject = $"[Arova Reminder] Upcoming: {date.Title}";
                        
                        var plainText = $"Hi {displayName},\n\nThis is a gentle Arova reminder that the special date \"{date.Title}\" is coming up in {daysRemaining} days ({nextOccur:MMMM dd}).\n\nKeep connecting and growing together!\n\n---\nYou’re receiving this because email notifications are enabled for your Arova space.\nFor privacy, this email only includes summaries, not private notes or sealed letter contents.";

                        var html = $@"
                        <div style=""font-family: 'Outfit', 'Inter', system-ui, sans-serif; max-width: 580px; margin: 0 auto; padding: 40px 20px; background-color: #051424; color: #F8F9FA; border-radius: 16px; border: 1px solid #1E293B; text-align: center;"">
                            <span style=""color: #D6B76A; font-size: 0.9rem; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;"">✦ Upcoming Reminder ✦</span>
                            <h1 style=""color: #FFFFFF; font-size: 2rem; margin-top: 8px; margin-bottom: 24px; font-weight: 700; letter-spacing: -0.025em;"">Arova Reminder</h1>
                            
                            <div style=""background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 32px; margin-bottom: 24px;"">
                                <p style=""font-size: 1.1rem; color: #E2E8F0; margin-top: 0; margin-bottom: 16px;"">Hi {displayName},</p>
                                <p style=""font-size: 1.15rem; color: #FFFFFF; font-weight: 600; line-height: 1.6; margin-bottom: 8px;"">""{date.Title}""</p>
                                <p style=""font-size: 1rem; color: #D6B76A; font-weight: 500; margin-top: 0; margin-bottom: 16px;"">is coming up in <strong>{daysRemaining}</strong> days ({nextOccur:MMMM dd})!</p>
                                <p style=""font-size: 0.9rem; color: #94A3B8; margin-top: 16px; margin-bottom: 0; font-style: italic;"">Arova reminder: a special date is coming soon.</p>
                            </div>
                            
                            <div style=""text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #1E293B;"">
                                <p style=""font-size: 0.85rem; color: #64748B; margin-bottom: 8px;"">
                                    You’re receiving this because email notifications are enabled for your Arova space.
                                </p>
                                <p style=""font-size: 0.85rem; color: #D6B76A; font-weight: 500; margin-top: 0;"">
                                    For privacy, this email only includes summaries, not private notes or sealed letter contents.
                                </p>
                            </div>
                        </div>";

                        await _emailSender.SendEmailAsync(user.Email, subject, plainText, html, cancellationToken);
                        reminderSentCount++;
                    }
                }
            }
        }

        return reminderSentCount;
    }

    public static DateTime CalculateNextOccurrence(DateTime originalDate, string recurrence)
    {
        var today = DateTime.UtcNow.Date;
        var date = originalDate.Date;
        
        if (recurrence == "yearly")
        {
            int year = today.Year;
            DateTime next;
            try
            {
                next = new DateTime(year, date.Month, date.Day);
            }
            catch (ArgumentOutOfRangeException)
            {
                next = new DateTime(year, 2, 28);
            }
            
            if (next < today)
            {
                year++;
                try
                {
                    next = new DateTime(year, date.Month, date.Day);
                }
                catch (ArgumentOutOfRangeException)
                {
                    next = new DateTime(year, 2, 28);
                }
            }
            return next;
        }
        
        if (recurrence == "monthly")
        {
            int year = today.Year;
            int month = today.Month;
            DateTime next;
            
            try
            {
                next = new DateTime(year, month, date.Day);
            }
            catch (ArgumentOutOfRangeException)
            {
                int maxDays = DateTime.DaysInMonth(year, month);
                next = new DateTime(year, month, maxDays);
            }
            
            if (next < today)
            {
                month++;
                if (month > 12)
                {
                    month = 1;
                    year++;
                }
                try
                {
                    next = new DateTime(year, month, date.Day);
                }
                catch (ArgumentOutOfRangeException)
                {
                    int maxDays = DateTime.DaysInMonth(year, month);
                    next = new DateTime(year, month, maxDays);
                }
            }
            return next;
        }
        
        return date;
    }

    private async Task<IReadOnlyList<ImportantDate>> GetVisibleDatesInternalAsync(Guid coupleId, Guid userId, CancellationToken cancellationToken)
    {
        return await _dbContext.ImportantDates
            .Where(d => d.CoupleId == coupleId && (!d.IsPrivate || d.CreatedByUserId == userId))
            .ToListAsync(cancellationToken);
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

    private static ImportantDateResponse MapToResponse(ImportantDate entity)
    {
        var nextOccur = CalculateNextOccurrence(entity.Date, entity.Recurrence);
        var daysRemaining = (nextOccur - DateTime.UtcNow.Date).Days;
        if (daysRemaining < 0) daysRemaining = 0;

        return new ImportantDateResponse
        {
            Id = entity.Id,
            CoupleId = entity.CoupleId,
            CreatedByUserId = entity.CreatedByUserId,
            Title = entity.Title,
            Description = entity.Description,
            Date = entity.Date,
            Type = entity.Type,
            Recurrence = entity.Recurrence,
            ReminderEnabled = entity.ReminderEnabled,
            ReminderDaysBefore = entity.ReminderDaysBefore,
            IsPrivate = entity.IsPrivate,
            DaysRemaining = daysRemaining,
            NextOccurrenceDate = nextOccur,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
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
