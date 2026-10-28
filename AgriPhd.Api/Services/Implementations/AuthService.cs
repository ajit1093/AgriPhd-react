using AgriPhd.Api.DTOs.Requests;
using AgriPhd.Api.DTOs.Responses;
using AgriPhd.Api.Helpers;
using AgriPhd.Api.Models;
using AgriPhd.Api.Repositories.Interfaces;
using AgriPhd.Api.Services.Interfaces;

namespace AgriPhd.Api.Services.Implementations;

/// <summary>
/// Ported business logic from legacy AccountWorker.
/// Key responsibilities beyond the repository:
///   - Transparent Base64 → bcrypt password migration (FR-AUTH-10)
///   - SecurityQuestionID <= 0 force-redirect flag
///   - SP return value convention: "N" = failure, anything else = success
/// </summary>
public class AuthService : IAuthService
{
    private readonly IAuthRepository _authRepo;
    private readonly ILogger<AuthService> _logger;

    public AuthService(IAuthRepository authRepo, ILogger<AuthService> logger)
    {
        _authRepo = authRepo;
        _logger = logger;
    }

    /// <inheritdoc/>
    public async Task<(LoggedInUser? user, string errorMessage)> LoginAsync(
        LoginRequest request,
        string browserName,
        string browserVersion,
        string ipAddress)
    {
        // Check what format the stored password is in
        var storedPassword = await _authRepo.GetUserPasswordAsync(request.LoginId);

        string passwordToSend;

        if (storedPassword != null && PasswordHelper.IsBcryptHash(storedPassword))
        {
            // Password is already bcrypt — verify locally, then pass a dummy that the SP won't
            // reject by temporarily replacing with the correct Base64 for comparison
            // Actually: call SP with the stored bcrypt hash as @UserPassword so SP comparison passes
            // The SP does: WHERE UserPassword = @UserPassword, so send the stored hash itself
            bool bcryptMatch = PasswordHelper.VerifyBcrypt(request.Password, storedPassword);
            if (!bcryptMatch)
                return (null, "Invalid Password.");

            // SP needs to match — send the stored hash so the WHERE clause passes
            passwordToSend = storedPassword;
        }
        else
        {
            // Legacy Base64 path
            passwordToSend = PasswordHelper.ToBase64(request.Password);
        }

        var user = await _authRepo.CheckUserExistsAsync(
            request.LoginId,
            passwordToSend,
            browserName,
            browserVersion,
            ipAddress);

        if (user == null)
            return (null, "Login failed. Please try again.");

        if (!user.IsLoginAllowed)
            return (null, string.IsNullOrWhiteSpace(user.ErrorMessage)
                ? "Invalid Login ID or password."
                : user.ErrorMessage);

        // ─── Transparent bcrypt migration (FR-AUTH-10) ────────────────────────
        // If SP confirmed credentials are correct but the stored value is still Base64,
        // upgrade to bcrypt now so future logins can use bcrypt.Verify().
        await MigratePasswordToBcryptIfNeededAsync(user.UserID, request.LoginId, request.Password, ipAddress);

        // Record the new session in DB
        await _authRepo.UpdateLoginStatusAsync(user.UserID, user.LoggedInSessionID);

        _logger.LogInformation(
            "User {LoginId} (UserTypeID={UserTypeId}) logged in successfully. SessionID={SessionId}",
            user.UserLoginID, user.UserTypeID, user.LoggedInSessionID);

        return (user, string.Empty);
    }

    /// <inheritdoc/>
    public async Task LogoutAsync(long userId, long sessionId)
    {
        await _authRepo.UpdateLogoutStatusAsync(userId, sessionId);
        _logger.LogInformation("User {UserId} logged out. SessionID={SessionId}", userId, sessionId);
    }

    /// <inheritdoc/>
    public async Task<bool> IsCurrentLoginValidAsync(long userId, long sessionId)
        => await _authRepo.IsCurrentLoginValidAsync(userId, sessionId);

    /// <inheritdoc/>
    public async Task<(bool success, string errorMessage)> ChangePasswordAsync(
        long userId, string userLoginId, ChangePasswordRequest request, string ipAddress)
    {
        if (request.NewPassword != request.ConfirmPassword)
            return (false, "New password and confirm password do not match.");

        // Verify current password
        var storedPassword = await _authRepo.GetUserPasswordAsync(userLoginId);
        if (storedPassword == null || !PasswordHelper.Verify(request.CurrentPassword, storedPassword))
            return (false, "Current password is incorrect.");

        // Hash new password with bcrypt
        var newHash = PasswordHelper.HashPassword(request.NewPassword);
        var success = await _authRepo.ResetPasswordAsync(userId, newHash, userLoginId, ipAddress);

        return success
            ? (true, "Password changed successfully.")
            : (false, "Failed to change password. Please try again.");
    }

    /// <inheritdoc/>
    public async Task<(bool success, string errorMessage)> ChangeSecurityQuestionAsync(
        long userId, string userLoginId, ChangeSecurityQuestionRequest request, string ipAddress)
    {
        var success = await _authRepo.ResetSecurityQuestionAsync(
            userId, request.SecurityQuestionId, request.SecurityAnswer, userLoginId, ipAddress);

        return success
            ? (true, "Security question updated successfully.")
            : (false, "Failed to update security question. Please try again.");
    }

    /// <inheritdoc/>
    public async Task<(bool success, string errorMessage)> ResetPasswordAsync(
        ResetPasswordRequest request, string loggedInUserLoginId, string ipAddress)
    {
        if (request.NewPassword != request.ConfirmPassword)
            return (false, "Passwords do not match.");

        var newHash = PasswordHelper.HashPassword(request.NewPassword);
        var success = await _authRepo.ResetPasswordAsync(
            request.UserId, newHash, loggedInUserLoginId, ipAddress);

        return success
            ? (true, "Password reset successfully.")
            : (false, "Failed to reset password. Please try again.");
    }

    /// <inheritdoc/>
    public async Task<(bool success, string errorMessage)> ForgotPasswordBySecurityQuestionAsync(
        ForgotPasswordBySecurityQuestionRequest request)
        => await _authRepo.CheckForgotPasswordBySecurityQuestionAsync(
            request.LoginId, request.SecurityQuestionId, request.SecurityAnswer);

    /// <inheritdoc/>
    public async Task<(bool found, string userLoginId, string errorMessage)> ForgotPasswordOtpLookupAsync(
        ForgotPasswordByOtpRequest request)
        => await _authRepo.CheckForgotPasswordByOtpLookupAsync(
            request.LoginId, request.EmailId ?? string.Empty, request.MobileNo ?? string.Empty);

    /// <inheritdoc/>
    public async Task<IEnumerable<SecurityQuestionResponse>> GetSecurityQuestionsAsync(long userId)
    {
        var questions = await _authRepo.GetSecurityQuestionsAsync(userId);
        return questions.Select(q => new SecurityQuestionResponse
        {
            SecurityQuestionId   = q.SecurityQuestionID,
            SecurityQuestionText = q.SecurityQuestionText
        });
    }

    /// <inheritdoc/>
    public async Task<(bool success, string errorMessage)> ChangeCandidateMobileNoAsync(
        long candidateId, string userLoginId, ChangeMobileRequest request, string ipAddress)
    {
        var success = await _authRepo.ChangeCandidateMobileNoAsync(
            candidateId, request.NewMobileNo, userLoginId, ipAddress);

        return success
            ? (true, "Mobile number updated successfully.")
            : (false, "Failed to update mobile number. Please try again.");
    }

    /// <inheritdoc/>
    public async Task<(bool success, string errorMessage)> ChangeCandidateEmailAsync(
        long candidateId, string userLoginId, ChangeEmailRequest request, string ipAddress)
    {
        var success = await _authRepo.ChangeCandidateEmailAsync(
            candidateId, request.NewEmailId, userLoginId, ipAddress);

        return success
            ? (true, "Email address updated successfully.")
            : (false, "Failed to update email. Please try again.");
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    /// <summary>
    /// Transparently migrates a Base64-encoded stored password to bcrypt
    /// on successful login, per FR-AUTH-10.
    /// </summary>
    private async Task MigratePasswordToBcryptIfNeededAsync(
        long userId, string userLoginId, string plainPassword, string ipAddress)
    {
        try
        {
            var storedPassword = await _authRepo.GetUserPasswordAsync(userLoginId);
            if (storedPassword != null && !PasswordHelper.IsBcryptHash(storedPassword))
            {
                _logger.LogInformation(
                    "Migrating Base64 password to bcrypt for UserID={UserId}", userId);
                var bcryptHash = PasswordHelper.HashPassword(plainPassword);
                await _authRepo.ResetPasswordAsync(userId, bcryptHash, userLoginId, ipAddress);
                _logger.LogInformation(
                    "Password migration to bcrypt completed for UserID={UserId}", userId);
            }
        }
        catch (Exception ex)
        {
            // Migration failure must not block login — log and continue
            _logger.LogWarning(ex,
                "bcrypt migration failed for UserID={UserId} — user is still logged in with Base64 password",
                userId);
        }
    }
}
