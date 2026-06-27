namespace LoveUniverse.Api.Services.Email;

public sealed class EmailOptions
{
    public string Provider { get; set; } = "Console";
    public string FromEmail { get; set; } = "no-reply@your-domain.com";
    public string FromName { get; set; } = "Arova";
    public string ResendApiKey { get; set; } = string.Empty;
    public bool DailyDigestEnabled { get; set; } = false;
}
