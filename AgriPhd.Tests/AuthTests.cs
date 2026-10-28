using AgriPhd.Api.Helpers;
using BC = BCrypt.Net.BCrypt;

namespace AgriPhd.Tests;

/// <summary>
/// P4-01 — AuthService: bcrypt migration logic, password verification.
/// Tests PasswordHelper class which wraps BCrypt + Base64 logic used in AuthService.
/// </summary>
public class AuthTests
{
    // ── IsBcryptHash ─────────────────────────────────────────────────────────

    [Fact]
    public void IsBcryptHash_ReturnsTrueForBcryptHash()
    {
        var hash = BC.HashPassword("SomePassword123!");
        Assert.True(PasswordHelper.IsBcryptHash(hash));
    }

    [Fact]
    public void IsBcryptHash_ReturnsFalseForBase64()
    {
        // Base64 of "TestPassword" = "VGVzdFBhc3N3b3Jk"
        var base64 = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes("TestPassword"));
        Assert.False(PasswordHelper.IsBcryptHash(base64));
    }

    [Fact]
    public void IsBcryptHash_ReturnsFalseForNullOrEmpty()
    {
        Assert.False(PasswordHelper.IsBcryptHash(null!));
        Assert.False(PasswordHelper.IsBcryptHash(string.Empty));
        Assert.False(PasswordHelper.IsBcryptHash("   "));
    }

    [Theory]
    [InlineData("$2a$11$abc")]
    [InlineData("$2b$12$xyz")]
    [InlineData("$2y$10$def")]
    public void IsBcryptHash_ReturnsTrueForAllBcryptVersionPrefixes(string prefix)
    {
        Assert.True(PasswordHelper.IsBcryptHash(prefix + new string('x', 50)));
    }

    // ── VerifyBcrypt ──────────────────────────────────────────────────────────

    [Fact]
    public void VerifyBcrypt_ReturnsTrueForCorrectPassword()
    {
        var password = "Divya@8007";
        var hash     = BC.HashPassword(password);
        Assert.True(PasswordHelper.VerifyBcrypt(password, hash));
    }

    [Fact]
    public void VerifyBcrypt_ReturnsFalseForWrongPassword()
    {
        var hash = BC.HashPassword("CorrectPassword");
        Assert.False(PasswordHelper.VerifyBcrypt("WrongPassword", hash));
    }

    [Fact]
    public void VerifyBcrypt_ReturnsFalseForNullOrEmpty()
    {
        var hash = BC.HashPassword("SomePassword");
        Assert.False(PasswordHelper.VerifyBcrypt(null!, hash));
        Assert.False(PasswordHelper.VerifyBcrypt("", hash));
    }

    [Fact]
    public void VerifyBcrypt_ReturnsFalseForNullHash()
    {
        Assert.False(PasswordHelper.VerifyBcrypt("SomePassword", null!));
    }

    // ── ToBase64 ──────────────────────────────────────────────────────────────

    [Fact]
    public void ToBase64_ReturnsBase64EncodedUtf8()
    {
        var result = PasswordHelper.ToBase64("TestPassword");
        var expected = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes("TestPassword"));
        Assert.Equal(expected, result);
    }

    [Fact]
    public void ToBase64_IsReversible()
    {
        var original = "Admin@123";
        var base64   = PasswordHelper.ToBase64(original);
        var decoded  = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(base64));
        Assert.Equal(original, decoded);
    }

    // ── Bcrypt migration logic ────────────────────────────────────────────────
    // Simulates the migration path in AuthService.LoginAsync:
    // If stored = Base64 → verify via Base64 comparison
    // If stored = bcrypt → verify via BCrypt.Verify
    // After successful Base64 login → upgrade to bcrypt

    [Fact]
    public void MigrationLogic_Base64PasswordVerifiesCorrectly()
    {
        var plainPassword = "J9z7TGFW";  // college user password
        var storedBase64  = PasswordHelper.ToBase64(plainPassword);

        // Before migration: compare Base64(input) with stored Base64
        var inputBase64 = PasswordHelper.ToBase64(plainPassword);
        Assert.Equal(storedBase64, inputBase64);  // SP WHERE clause passes
        Assert.False(PasswordHelper.IsBcryptHash(storedBase64));  // identified as Base64
    }

    [Fact]
    public void MigrationLogic_AfterMigration_BcryptVerifiesCorrectly()
    {
        var plainPassword = "J9z7TGFW";

        // Simulate migration: Base64 → bcrypt
        var bcryptHash = BC.HashPassword(plainPassword, workFactor: 11);
        Assert.True(PasswordHelper.IsBcryptHash(bcryptHash));
        Assert.True(PasswordHelper.VerifyBcrypt(plainPassword, bcryptHash));

        // Old Base64 no longer matches
        var base64 = PasswordHelper.ToBase64(plainPassword);
        Assert.NotEqual(base64, bcryptHash);
    }

    [Fact]
    public void MigrationLogic_WrongPasswordFailsBothPaths()
    {
        var correctPassword = "CorrectPassword123!";
        var wrongPassword   = "WrongPassword456!";

        // Base64 path
        var storedBase64 = PasswordHelper.ToBase64(correctPassword);
        Assert.NotEqual(storedBase64, PasswordHelper.ToBase64(wrongPassword));

        // Bcrypt path
        var bcryptHash = BC.HashPassword(correctPassword);
        Assert.False(PasswordHelper.VerifyBcrypt(wrongPassword, bcryptHash));
    }
}
