namespace AgriPhd.Api.Models;

/// <summary>
/// Strongly-typed representation of the AppSettings section in appsettings.json.
/// </summary>
public class AppSettings
{
    /// <summary>
    /// When "YES", mobile OTP verification is skipped (dev/UAT). When "NO", OTP is required (production).
    /// Maps to legacy DevEnvironment app setting.
    /// </summary>
    public string DevEnvironment { get; set; } = "NO";

    public bool IsDevEnvironment => DevEnvironment.Equals("YES", StringComparison.OrdinalIgnoreCase);

    public string IsCaptchaVerificationRequired { get; set; } = "Y";
    public bool CaptchaRequired => IsCaptchaVerificationRequired.Equals("Y", StringComparison.OrdinalIgnoreCase);

    public string CheckDuplicateMobileNo { get; set; } = "Y";
    public bool DuplicateMobileCheck => CheckDuplicateMobileNo.Equals("Y", StringComparison.OrdinalIgnoreCase);

    public string CheckDuplicateEMailID { get; set; } = "Y";
    public bool DuplicateEmailCheck => CheckDuplicateEMailID.Equals("Y", StringComparison.OrdinalIgnoreCase);

    public bool IsMultipleLoginAllowed { get; set; } = false;

    public string WebsiteHeader { get; set; } = "AgriPHD Online Admissions Portal";

    public string ReactAppOrigin { get; set; } = "http://localhost:5173";
}

public class JwtSettings
{
    public string SecretKey { get; set; } = string.Empty;
    public string Issuer { get; set; } = "AgriPhd.Api";
    public string Audience { get; set; } = "AgriPhd.Web";
    public int AccessTokenExpiryMinutes { get; set; } = 20;
    public int RefreshTokenExpiryHours { get; set; } = 8;
}

public class AzureBlobStorageSettings
{
    public string ConnectionString { get; set; } = string.Empty;
    public string ContainerName { get; set; } = "agri-phd-docs";
}

public class RazorpaySettings
{
    public string Key { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
}
