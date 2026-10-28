using System.Text;

namespace AgriPhd.Api.Helpers;

/// <summary>
/// Password utilities for the transparent Base64 → bcrypt migration.
/// </summary>
public static class PasswordHelper
{
    public static string ToBase64(string plainText)
        => Convert.ToBase64String(Encoding.UTF8.GetBytes(plainText));

    public static string FromBase64(string base64)
        => Encoding.UTF8.GetString(Convert.FromBase64String(base64));

    public static string HashPassword(string plainText)
        => BCrypt.Net.BCrypt.HashPassword(plainText, workFactor: 11);

    public static bool VerifyBcrypt(string plainText, string bcryptHash)
    {
        if (string.IsNullOrEmpty(plainText) || string.IsNullOrEmpty(bcryptHash)) return false;
        try { return BCrypt.Net.BCrypt.Verify(plainText, bcryptHash); }
        catch { return false; }
    }

    public static bool IsBcryptHash(string storedPassword)
        => !string.IsNullOrEmpty(storedPassword) && storedPassword.StartsWith("$2");

    public static bool Verify(string plainText, string storedPassword)
    {
        if (string.IsNullOrEmpty(storedPassword)) return false;
        if (IsBcryptHash(storedPassword))
            return VerifyBcrypt(plainText, storedPassword);
        return ToBase64(plainText) == storedPassword;
    }

    private static readonly char[] _pwdChars =
        "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789@#$!".ToCharArray();

    /// <summary>Generates a random 8-char password for bulk password generation.</summary>
    public static string GenerateRandomPassword(int length = 8)
    {
        var bytes = System.Security.Cryptography.RandomNumberGenerator.GetBytes(length);
        return new string(bytes.Select(b => _pwdChars[b % _pwdChars.Length]).ToArray());
    }
}
