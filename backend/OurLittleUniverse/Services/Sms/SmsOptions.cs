namespace LoveUniverse.Api.Services.Sms;

public sealed class SmsOptions
{
    public string Provider { get; set; } = "Console";
    public string TwilioAccountSid { get; set; } = string.Empty;
    public string TwilioAuthToken { get; set; } = string.Empty;
    public string TwilioFromNumber { get; set; } = string.Empty;
}
