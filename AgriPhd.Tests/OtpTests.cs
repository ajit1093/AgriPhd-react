using AgriPhd.Api.Helpers;

namespace AgriPhd.Tests;

/// <summary>
/// P4-04 — OTP generation and uniqueness tests.
/// OtpHelper.GenerateOtp uses RandomNumberGenerator (cryptographically secure).
/// The DB SP (Base_GetOTP) handles expiry — tests here cover generation only.
/// </summary>
public class OtpTests
{
    // ── Format ────────────────────────────────────────────────────────────────

    [Fact]
    public void GenerateOtp_DefaultLength_Returns4Digits()
    {
        var otp = OtpHelper.GenerateOtp();
        Assert.Equal(4, otp.Length);
        Assert.True(otp.All(char.IsDigit), $"OTP '{otp}' contains non-digit characters");
    }

    [Theory]
    [InlineData(4)]
    [InlineData(6)]
    [InlineData(8)]
    public void GenerateOtp_ReturnsCorrectLength(int length)
    {
        var otp = OtpHelper.GenerateOtp(length);
        Assert.Equal(length, otp.Length);
        Assert.True(otp.All(char.IsDigit));
    }

    [Fact]
    public void GenerateOtp_OnlyContainsDigits()
    {
        for (int i = 0; i < 100; i++)
        {
            var otp = OtpHelper.GenerateOtp(4);
            Assert.Matches(@"^\d{4}$", otp);
        }
    }

    // ── Range ─────────────────────────────────────────────────────────────────

    [Fact]
    public void GenerateOtp_EachDigitInRange0To9()
    {
        // Generate many OTPs and verify all digits fall in 0-9
        var allDigits = new System.Collections.Generic.HashSet<char>();
        for (int i = 0; i < 1000; i++)
        {
            foreach (var c in OtpHelper.GenerateOtp(4))
                allDigits.Add(c);
        }
        // All digits 0-9 should appear in 1000 iterations
        for (char c = '0'; c <= '9'; c++)
            Assert.Contains(c, allDigits);
    }

    // ── Uniqueness ────────────────────────────────────────────────────────────

    [Fact]
    public void GenerateOtp_IsNotAlwaysSame()
    {
        // With 10,000 possible 4-digit OTPs, generating 50 should have some variation
        var otps = Enumerable.Range(0, 50).Select(_ => OtpHelper.GenerateOtp()).ToHashSet();
        // Probability of all 50 being identical is 10^-196 — astronomically unlikely
        Assert.True(otps.Count > 1, "OTP generator appears to always return same value — not random");
    }

    // ── Cryptographic quality (smoke test) ────────────────────────────────────

    [Fact]
    public void GenerateOtp_UsesSecureRandom_NotSystemRandom()
    {
        // If System.Random were seeded with same value, subsequent calls
        // with new Random() would produce correlated outputs.
        // With RandomNumberGenerator there should be no such correlation.
        // This is a smoke test: generate 100 OTPs, verify no obvious pattern.
        var otps = Enumerable.Range(0, 100).Select(_ => OtpHelper.GenerateOtp()).ToList();
        var distinct = otps.Distinct().Count();
        // 100 OTPs from 10000 possible values: expect at minimum 30 distinct
        Assert.True(distinct >= 30, $"Only {distinct} distinct OTPs in 100 — possible low-entropy source");
    }

    // ── DB expiry contract (documented, not unit-testable without DB) ─────────

    [Fact(Skip = "Requires DB — SP Base_GetOTP overwrites previous OTP each time; expiry enforced at SP level via CreateDateTime comparison")]
    public void OtpExpiry_HandledByStoredProcedure()
    {
        // The SP Base_GetOTP stores: MobileNo, Purpose, OTP, CreateDateTime=GETDATE()
        // VerifyOTP SP: SELECT WHERE OTP=@OTP AND DATEDIFF(minute, CreateDateTime, GETDATE()) < 10
        // Expiry is 10 minutes — enforced at DB level, not in application code.
        // No application-layer code to unit test for this behavior.
    }
}
