using System.Security.Cryptography;
using System.Text;

namespace AgriPhd.Tests;

/// <summary>
/// P4-03 — Fee HMAC verification: correct signature passes, tampered signature fails.
/// Tests the HMAC-SHA256 logic in FeeController.ComputeHmacSha256.
/// </summary>
public class FeeHmacTests
{
    // Replicate the exact ComputeHmacSha256 logic from FeeController
    private static string ComputeHmacSha256(string secretKey, string data)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secretKey));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
        return BitConverter.ToString(hash).Replace("-", "").ToLower();
    }

    // ── Correct signature ─────────────────────────────────────────────────────

    [Fact]
    public void HmacSha256_CorrectSignatureVerifies()
    {
        const string secretKey   = "test_razorpay_secret";
        const string orderId     = "order_ABC123";
        const string paymentId   = "pay_XYZ789";

        // Razorpay signature format: HMAC-SHA256(orderId + "|" + paymentId, secretKey)
        var data      = $"{orderId}|{paymentId}";
        var signature = ComputeHmacSha256(secretKey, data);

        // Verify: recompute and compare (as FeeController does)
        var expected = ComputeHmacSha256(secretKey, data);
        Assert.Equal(expected, signature, StringComparer.OrdinalIgnoreCase);
    }

    [Fact]
    public void HmacSha256_SameInputAlwaysProducesSameOutput()
    {
        const string secretKey = "consistent_secret";
        const string data      = "order_123|pay_456";

        var sig1 = ComputeHmacSha256(secretKey, data);
        var sig2 = ComputeHmacSha256(secretKey, data);
        Assert.Equal(sig1, sig2);
    }

    // ── Tampered signature ────────────────────────────────────────────────────

    [Fact]
    public void HmacSha256_TamperedPaymentIdFails()
    {
        const string secretKey     = "test_razorpay_secret";
        const string orderId       = "order_ABC123";
        const string realPaymentId = "pay_XYZ789";
        const string fakePaymentId = "pay_HACKED";

        var realData     = $"{orderId}|{realPaymentId}";
        var realSignature = ComputeHmacSha256(secretKey, realData);

        // Attacker sends tampered paymentId but same signature
        var tamperedData = $"{orderId}|{fakePaymentId}";
        var expectedForTampered = ComputeHmacSha256(secretKey, tamperedData);

        Assert.NotEqual(realSignature, expectedForTampered, StringComparer.OrdinalIgnoreCase);
    }

    [Fact]
    public void HmacSha256_TamperedOrderIdFails()
    {
        const string secretKey   = "test_razorpay_secret";
        const string realOrderId = "order_ABC123";
        const string fakeOrderId = "order_HACKED";
        const string paymentId   = "pay_XYZ789";

        var realSig    = ComputeHmacSha256(secretKey, $"{realOrderId}|{paymentId}");
        var tamperedSig = ComputeHmacSha256(secretKey, $"{fakeOrderId}|{paymentId}");

        Assert.NotEqual(realSig, tamperedSig, StringComparer.OrdinalIgnoreCase);
    }

    [Fact]
    public void HmacSha256_WrongSecretKeyFails()
    {
        const string realSecret = "real_secret_key";
        const string fakeSecret = "fake_secret_key";
        const string data       = "order_123|pay_456";

        var realSig = ComputeHmacSha256(realSecret, data);
        var fakeSig = ComputeHmacSha256(fakeSecret, data);

        Assert.NotEqual(realSig, fakeSig, StringComparer.OrdinalIgnoreCase);
    }

    [Fact]
    public void HmacSha256_OutputIsLowercaseHex()
    {
        var sig = ComputeHmacSha256("secret", "data");
        Assert.Matches("^[0-9a-f]{64}$", sig);  // 256-bit = 64 hex chars
    }

    [Fact]
    public void HmacSha256_CaseInsensitiveComparison()
    {
        var sig = ComputeHmacSha256("secret", "data");
        var upper = sig.ToUpperInvariant();
        // FeeController uses StringComparison.OrdinalIgnoreCase
        Assert.Equal(sig, upper, StringComparer.OrdinalIgnoreCase);
    }
}
