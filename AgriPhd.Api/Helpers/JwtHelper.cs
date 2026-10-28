using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AgriPhd.Api.Models;
using Microsoft.IdentityModel.Tokens;

namespace AgriPhd.Api.Helpers;

/// <summary>
/// Issues and validates JWT tokens for the AgriPhd API.
/// Tokens are stored in httpOnly + Secure + SameSite=Strict cookies.
/// Payload mirrors the legacy LoggedInUser session object fields needed by the React app.
/// </summary>
public class JwtHelper
{
    private readonly string _secretKey;
    private readonly string _issuer;
    private readonly string _audience;
    private readonly int _accessTokenExpiryMinutes;

    // Claim type constants — used both here and in the auth middleware
    public const string ClaimUserId           = "userId";
    public const string ClaimUserTypeId       = "userTypeId";
    public const string ClaimUserLoginId      = "userLoginId";
    public const string ClaimUserName         = "userName";
    public const string ClaimDashboardPath    = "dashboardPath";
    public const string ClaimSessionId        = "sessionId";
    public const string ClaimIsAdmin          = "isAdmin";
    public const string ClaimSecurityQSet     = "securityQuestionSet";

    public JwtHelper(string secretKey, string issuer, string audience, int accessTokenExpiryMinutes)
    {
        _secretKey = secretKey;
        _issuer = issuer;
        _audience = audience;
        _accessTokenExpiryMinutes = accessTokenExpiryMinutes;
    }

    /// <summary>
    /// Generates a JWT access token from a LoggedInUser.
    /// </summary>
    public string GenerateToken(LoggedInUser user)
    {
        var claims = new List<Claim>
        {
            new(ClaimUserId,        user.UserID.ToString()),
            new(ClaimUserTypeId,    user.UserTypeID.ToString()),
            new(ClaimUserLoginId,   user.UserLoginID),
            new(ClaimUserName,      user.UserName),
            new(ClaimDashboardPath, user.DashBoardPath),
            new(ClaimSessionId,     user.LoggedInSessionID.ToString()),
            new(ClaimIsAdmin,       user.IsAdmin.ToString()),
            new(ClaimSecurityQSet,  (user.SecurityQuestionID > 0).ToString()),
            // Standard claims
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(JwtRegisteredClaimNames.Sub, user.UserLoginID),
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_accessTokenExpiryMinutes),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    /// <summary>
    /// Validates a token and returns its claims principal.
    /// Returns null if invalid or expired.
    /// </summary>
    public ClaimsPrincipal? ValidateToken(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_secretKey);

        try
        {
            var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = _issuer,
                ValidateAudience = true,
                ValidAudience = _audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero, // Strict — no grace period
            }, out _);

            return principal;
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Generates a random CSRF token (32 hex chars).
    /// </summary>
    public static string GenerateCsrfToken()
        => Convert.ToHexString(System.Security.Cryptography.RandomNumberGenerator.GetBytes(16));
}
