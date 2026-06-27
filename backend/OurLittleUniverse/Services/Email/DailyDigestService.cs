using System.Text;
using LoveUniverse.Api.Data;
using LoveUniverse.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace LoveUniverse.Api.Services.Email;

public sealed class DailyDigestService : IDailyDigestService
{
    private readonly AppDbContext _dbContext;
    private readonly IEmailSender _emailSender;
    private readonly ILogger<DailyDigestService> _logger;

    public DailyDigestService(
        AppDbContext dbContext,
        IEmailSender emailSender,
        ILogger<DailyDigestService> logger)
    {
        _dbContext = dbContext;
        _emailSender = emailSender;
        _logger = logger;
    }

    public async Task<int> SendDailyDigestsAsync(CancellationToken cancellationToken = default)
    {
        var activeCouplesWithSettings = await _dbContext.Couples
            .Include(c => c.Settings)
            .Include(c => c.Members)
                .ThenInclude(m => m.User)
            .Where(c => c.IsActive && c.Settings != null && c.Settings.EmailNotificationsEnabled && c.Settings.DailyDigestEnabled)
            .ToListAsync(cancellationToken);

        int sentCount = 0;
        foreach (var couple in activeCouplesWithSettings)
        {
            var success = await SendDigestForCoupleAsync(couple, cancellationToken);
            if (success)
            {
                sentCount++;
            }
        }

        return sentCount;
    }

    public async Task<bool> SendTestDailyDigestAsync(Guid coupleId, CancellationToken cancellationToken = default)
    {
        var couple = await _dbContext.Couples
            .Include(c => c.Settings)
            .Include(c => c.Members)
                .ThenInclude(m => m.User)
            .FirstOrDefaultAsync(c => c.Id == coupleId, cancellationToken);

        if (couple is null)
        {
            _logger.LogWarning("Test daily digest requested for non-existent couple {CoupleId}", coupleId);
            return false;
        }

        _logger.LogInformation("Sending test daily digest for couple {CoupleId} (settings override applied)", coupleId);
        return await SendDigestForCoupleAsync(couple, cancellationToken, forceSend: true);
    }

    private async Task<bool> SendDigestForCoupleAsync(Couple couple, CancellationToken cancellationToken, bool forceSend = false)
    {
        var members = couple.Members.Where(m => m.IsActive && m.User != null && m.User.IsActive && !string.IsNullOrWhiteSpace(m.User.Email)).ToList();
        if (members.Count == 0)
        {
            _logger.LogInformation("No active members with valid email found for couple {CoupleId}. Skipping digest.", couple.Id);
            return false;
        }

        // Fetch counts for the last 24 hours
        var since = DateTime.UtcNow.AddDays(-1);

        var memoriesCount = await _dbContext.Memories
            .CountAsync(m => m.CoupleId == couple.Id && m.CreatedAt >= since, cancellationToken);

        var reasonsCount = await _dbContext.Reasons
            .CountAsync(r => r.CoupleId == couple.Id && r.CreatedAt >= since, cancellationToken);

        var lettersCount = await _dbContext.Letters
            .CountAsync(l => l.CoupleId == couple.Id && l.CreatedAt >= since, cancellationToken);

        var moodCount = await _dbContext.MoodEntries
            .CountAsync(m => m.CoupleId == couple.Id && m.CreatedAt >= since, cancellationToken);

        var checkInCount = await _dbContext.CheckIns
            .CountAsync(c => c.CoupleId == couple.Id && c.CreatedAt >= since, cancellationToken);

        var dailyQuestionAnswersCount = await _dbContext.DailyQuestionAnswers
            .CountAsync(a => a.CoupleId == couple.Id && a.CreatedAt >= since, cancellationToken);

        var pointsGained = await _dbContext.RelationshipPointLedgers
            .Where(l => l.CoupleId == couple.Id && l.CreatedAt >= since)
            .SumAsync(l => l.Points, cancellationToken);

        // Compute streak dynamically
        var distinctDates = await _dbContext.RelationshipPointLedgers
            .AsNoTracking()
            .Where(ledger => ledger.CoupleId == couple.Id)
            .Select(ledger => ledger.CreatedAt.Date)
            .Distinct()
            .OrderByDescending(d => d)
            .ToListAsync(cancellationToken);

        int streak = 0;
        if (distinctDates.Count > 0)
        {
            var today = DateTime.UtcNow.Date;
            var yesterday = today.AddDays(-1);
            var mostRecent = distinctDates[0];
            if (mostRecent == today || mostRecent == yesterday)
            {
                var expected = mostRecent;
                foreach (var date in distinctDates)
                {
                    if (date == expected)
                    {
                        streak++;
                        expected = expected.AddDays(-1);
                    }
                    else
                    {
                        break;
                    }
                }
            }
        }

        // Only send if there is actual activity, or if it is a force/test send
        bool hasActivity = memoriesCount > 0 || reasonsCount > 0 || lettersCount > 0 || moodCount > 0 || checkInCount > 0 || dailyQuestionAnswersCount > 0 || pointsGained > 0;
        if (!hasActivity && !forceSend)
        {
            _logger.LogInformation("No new activity for couple {CoupleId} in the last 24 hours. Skipping digest email.", couple.Id);
            return false;
        }

        foreach (var member in members)
        {
            var user = member.User;
            var displayName = user.DisplayName ?? user.Username;

            var (plainText, html) = FormatDigest(
                displayName,
                memoriesCount,
                reasonsCount,
                lettersCount,
                moodCount + checkInCount,
                dailyQuestionAnswersCount,
                pointsGained,
                streak);

            await _emailSender.SendEmailAsync(
                user.Email,
                $"Your Arova Daily Summary ✦ {DateTime.UtcNow:MMMM dd, yyyy}",
                plainText,
                html,
                cancellationToken);
        }

        return true;
    }

    private (string plainText, string html) FormatDigest(
        string displayName,
        int memories,
        int reasons,
        int letters,
        int moods,
        int questions,
        int points,
        int streak)
    {
        var textBuilder = new StringBuilder();
        textBuilder.AppendLine($"Hi {displayName},");
        textBuilder.AppendLine();
        textBuilder.AppendLine("Here is today's safe activity summary in your Arova universe:");
        textBuilder.AppendLine();

        if (memories > 0) textBuilder.AppendLine($"- {memories} {(memories == 1 ? "memory was" : "memories were")} saved.");
        if (reasons > 0) textBuilder.AppendLine($"- {reasons} {(reasons == 1 ? "reason was" : "reasons were")} shared.");
        if (letters > 0) textBuilder.AppendLine($"- {letters} {(letters == 1 ? "letter was" : "letters were")} written.");
        if (moods > 0) textBuilder.AppendLine($"- {moods} mood check-in{(moods == 1 ? " was" : "s were")} shared.");
        if (questions > 0) textBuilder.AppendLine($"- {questions} daily question{(questions == 1 ? " was" : "s were")} answered.");
        if (points > 0) textBuilder.AppendLine($"- Your orbit gained {points} point{(points == 1 ? "" : "s")}.");
        if (streak > 0) textBuilder.AppendLine($"- Your current streak is {streak} day{(streak == 1 ? "" : "s")}!");

        if (memories == 0 && reasons == 0 && letters == 0 && moods == 0 && questions == 0 && points == 0)
        {
            textBuilder.AppendLine("- No new activity was recorded in the last 24 hours.");
            textBuilder.AppendLine("Arova is a quiet place. Reach out to your partner to check in, write a letter, or share a memory whenever you are ready.");
        }

        textBuilder.AppendLine();
        textBuilder.AppendLine("Keep connecting and growing together!");
        textBuilder.AppendLine();
        textBuilder.AppendLine("---");
        textBuilder.AppendLine("You’re receiving this because email notifications are enabled for your Arova space.");
        textBuilder.AppendLine("For privacy, this email only includes summaries, not private notes or sealed letter contents.");

        // HTML version
        var htmlListBuilder = new StringBuilder();
        if (memories > 0) htmlListBuilder.AppendLine($"<li style=\"margin-bottom: 12px; font-size: 1.05rem;\">💾 <strong>{memories}</strong> {(memories == 1 ? "memory was" : "memories were")} saved.</li>");
        if (reasons > 0) htmlListBuilder.AppendLine($"<li style=\"margin-bottom: 12px; font-size: 1.05rem;\">💖 <strong>{reasons}</strong> {(reasons == 1 ? "reason was" : "reasons were")} shared.</li>");
        if (letters > 0) htmlListBuilder.AppendLine($"<li style=\"margin-bottom: 12px; font-size: 1.05rem;\">✉️ <strong>{letters}</strong> {(letters == 1 ? "letter was" : "letters were")} written.</li>");
        if (moods > 0) htmlListBuilder.AppendLine($"<li style=\"margin-bottom: 12px; font-size: 1.05rem;\">🌟 <strong>{moods}</strong> mood check-in{(moods == 1 ? " was" : "s were")} shared.</li>");
        if (questions > 0) htmlListBuilder.AppendLine($"<li style=\"margin-bottom: 12px; font-size: 1.05rem;\">❓ <strong>{questions}</strong> daily question{(questions == 1 ? " was" : "s were")} answered.</li>");
        if (points > 0) htmlListBuilder.AppendLine($"<li style=\"margin-bottom: 12px; font-size: 1.05rem;\">🪐 Your orbit gained <strong>{points}</strong> point{(points == 1 ? "" : "s")}.</li>");
        if (streak > 0) htmlListBuilder.AppendLine($"<li style=\"margin-bottom: 12px; font-size: 1.05rem;\">🔥 Your current streak is <strong>{streak}</strong> day{(streak == 1 ? "" : "s")}!</li>");

        if (memories == 0 && reasons == 0 && letters == 0 && moods == 0 && questions == 0 && points == 0)
        {
            htmlListBuilder.AppendLine("<li style=\"margin-bottom: 12px; font-size: 1.05rem; list-style-type: none; color: #94A3B8;\">No new activity was recorded in the last 24 hours. Arova is a quiet place. Reach out to your partner to check in, write a letter, or share a memory whenever you are ready.</li>");
        }

        var html = $@"
        <div style=""font-family: 'Outfit', 'Inter', system-ui, sans-serif; max-width: 580px; margin: 0 auto; padding: 40px 20px; background-color: #051424; color: #F8F9FA; border-radius: 16px; border: 1px solid #1E293B;"">
            <header style=""text-align: center; margin-bottom: 32px;"">
                <span style=""color: #D6B76A; font-size: 0.9rem; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;"">✦ Daily Digest ✦</span>
                <h1 style=""color: #FFFFFF; font-size: 2rem; margin-top: 8px; margin-bottom: 0; font-weight: 700; letter-spacing: -0.025em;"">Your Arova Summary</h1>
                <p style=""color: #64748B; font-size: 0.95rem; margin-top: 6px;"">{DateTime.UtcNow:MMMM dd, yyyy}</p>
            </header>
            
            <div style=""background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 32px; margin-bottom: 24px;"">
                <p style=""font-size: 1.1rem; color: #E2E8F0; margin-top: 0; margin-bottom: 20px;"">Hi {displayName},</p>
                <p style=""font-size: 1rem; color: #94A3B8; line-height: 1.6; margin-bottom: 24px;"">Here is a safe summary of your shared space from the last 24 hours:</p>
                
                <ul style=""padding-left: 20px; color: #E2E8F0; line-height: 1.6; margin-bottom: 0;"">
                    {htmlListBuilder}
                </ul>
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

        return (textBuilder.ToString(), html);
    }
}
