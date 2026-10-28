using System.Security.Cryptography;

namespace AgriPhd.Api.Helpers;

/// <summary>
/// OTP generation helper — ported from legacy Helper.GenerateOTP(length).
/// Uses cryptographically secure random number generation (RandomNumberGenerator)
/// instead of legacy System.Random for security improvement.
/// </summary>
public static class OtpHelper
{
    /// <summary>
    /// Generates a numeric OTP of the specified length.
    /// Legacy system uses 4 digits for all OTP purposes.
    /// </summary>
    public static string GenerateOtp(int length = 4)
    {
        var digits = new char[length];
        for (int i = 0; i < length; i++)
        {
            // Generate a single digit 0–9
            digits[i] = (char)('0' + (RandomNumberGenerator.GetInt32(0, 10)));
        }
        return new string(digits);
    }
}
