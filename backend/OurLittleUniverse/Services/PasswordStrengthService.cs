using LoveUniverse.Api.DTOs.Auth;

namespace LoveUniverse.Api.Services;

public sealed class PasswordStrengthService : IPasswordStrengthService
{
    private static readonly HashSet<string> CommonWeakPasswords = new(StringComparer.OrdinalIgnoreCase)
    {
        "password",
        "12345678",
        "qwerty123",
        "password123",
        "admin123",
        "letmein",
        "iloveyou",
        "11111111",
        "welcome1",
        "abc12345",
        "monkey123",
        "dragon12",
        "master12",
        "sunshine1",
        "princess1",
        "football1",
        "shadow12",
        "trustno1",
        "baseball1",
        "superman1",
        "michael1",
        "charlie1",
        "access14",
        "1234567890",
        "passw0rd",
        "pass1234",
        "love1234",
        "hello123",
        "test1234",
        "changeme"
    };

    private static readonly string[] PredictableSequences =
    [
        "123456",
        "abcdef",
        "qwerty",
        "asdfgh",
        "111111",
        "000000"
    ];

    public PasswordStrengthResponse CheckStrength(string password)
    {
        var feedback = new List<string>();
        var value = password ?? string.Empty;
        var normalized = value.Trim().ToLowerInvariant();

        var score = 0;

        if (value.Length >= 8)
        {
            score++;
        }
        else
        {
            feedback.Add("Use at least 8 characters.");
        }

        if (value.Length >= 14)
        {
            score++;
        }
        else
        {
            feedback.Add("A longer passphrase is easier to remember and harder to guess.");
        }

        var hasLetter = value.Any(char.IsLetter);
        var hasDigit = value.Any(char.IsDigit);
        var hasSymbolOrSpace = value.Any(character => !char.IsLetterOrDigit(character));
        if ((hasLetter && hasDigit) || (hasLetter && hasSymbolOrSpace) || (hasDigit && hasSymbolOrSpace))
        {
            score++;
        }
        else
        {
            feedback.Add("Mix words, numbers, or spaces so it is less predictable.");
        }

        if (HasRepeatedCharacters(value))
        {
            feedback.Add("Avoid long repeated character runs.");
            score--;
        }

        if (CommonWeakPasswords.Contains(normalized))
        {
            feedback.Add("This password is too common.");
            score = 0;
        }

        if (PredictableSequences.Any(sequence => normalized.Contains(sequence, StringComparison.OrdinalIgnoreCase)))
        {
            feedback.Add("Avoid predictable keyboard or number sequences.");
            score = Math.Min(score, 1);
        }

        score = Math.Clamp(score, 0, 4);
        var label = score switch
        {
            >= 4 => "Strong",
            3 => "Good",
            2 => "Okay",
            _ => "Weak"
        };

        if (feedback.Count == 0)
        {
            feedback.Add("Good passphrase. Keep it unique to Arova.");
        }

        return new PasswordStrengthResponse
        {
            Score = score,
            Label = label,
            Feedback = feedback
        };
    }

    public ContentServiceResult<PasswordStrengthResponse> ValidateForRegistration(string password)
    {
        if (string.IsNullOrEmpty(password))
        {
            return ContentServiceResult<PasswordStrengthResponse>.Failure(ContentServiceStatus.BadRequest, "Password is required.");
        }

        if (password.Length < 8)
        {
            return ContentServiceResult<PasswordStrengthResponse>.Failure(ContentServiceStatus.BadRequest, "Use a password or passphrase with at least 8 characters.");
        }

        if (password.Length > 128)
        {
            return ContentServiceResult<PasswordStrengthResponse>.Failure(ContentServiceStatus.BadRequest, "Password is too long.");
        }

        var strength = CheckStrength(password);
        if (strength.Score < 3)
        {
            return ContentServiceResult<PasswordStrengthResponse>.Failure(ContentServiceStatus.BadRequest, "Please choose a stronger password or passphrase. Use at least 14 characters mixing words, numbers, and spaces.");
        }

        return ContentServiceResult<PasswordStrengthResponse>.Success(strength);
    }

    private static bool HasRepeatedCharacters(string value)
    {
        var currentRun = 1;
        for (var i = 1; i < value.Length; i++)
        {
            if (value[i] == value[i - 1])
            {
                currentRun++;
                if (currentRun >= 5)
                {
                    return true;
                }
            }
            else
            {
                currentRun = 1;
            }
        }

        return false;
    }
}
