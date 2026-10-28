using AgriPhd.Api.Models;

namespace AgriPhd.Api.Repositories.Interfaces;

/// <summary>
/// Mirrors the legacy IAccount interface, restricted to auth-critical operations.
/// All method names, SP names, and parameter names preserved exactly from the legacy
/// Admission.Data/Pool/Account/Repository.Account.cs.
/// </summary>
public interface IAuthRepository
{
    /// <summary>
    /// Validates credentials. SP: Account_CheckUserExists.
    /// Returns null if SP returns no rows (should not happen — SP always returns at least error state).
    /// </summary>
    Task<LoggedInUser?> CheckUserExistsAsync(
        string userLoginId,
        string passwordBase64,
        string browserName,
        string browserVersion,
        string ipAddress);

    /// <summary>
    /// Records the new login session. SP: Account_UpdateLoginStatus.
    /// </summary>
    Task UpdateLoginStatusAsync(long userId, long loggedInSessionId);

    /// <summary>
    /// Clears the session on logout. SP: Account_UpdateLogoutStatus.
    /// </summary>
    Task UpdateLogoutStatusAsync(long userId, long loggedInSessionId);

    /// <summary>
    /// Called on every authenticated request to detect concurrent login.
    /// SP: Account_IsCurrentLoginValid. Returns false → 401.
    /// </summary>
    Task<bool> IsCurrentLoginValidAsync(long userId, long loggedInSessionId);

    /// <summary>
    /// Reads the stored (Base64 or bcrypt) password for a login ID.
    /// Used for the transparent bcrypt migration on first login.
    /// SP: Account_GetUserPassword.
    /// </summary>
    Task<string?> GetUserPasswordAsync(string userLoginId);

    /// <summary>
    /// Saves the new bcrypt hash after transparent migration.
    /// SP: Account_ResetPassword.
    /// </summary>
    Task<bool> ResetPasswordAsync(long userId, string newPasswordHashed, string loggedInUserLoginId, string ipAddress);

    /// <summary>
    /// Verifies security question for forgot-password flow.
    /// SP: Account_CheckForgotPassword.
    /// </summary>
    Task<(bool success, string errorMessage)> CheckForgotPasswordBySecurityQuestionAsync(
        string userLoginId, short securityQuestionId, string securityAnswer);

    /// <summary>
    /// Looks up user account for OTP-based forgot-password.
    /// SP: Account_CheckForgotPasswordByOTP.
    /// </summary>
    Task<(bool found, string userLoginId, string errorMessage)> CheckForgotPasswordByOtpLookupAsync(
        string userLoginId, string emailId, string mobileNo);

    /// <summary>
    /// Resets the security question.
    /// SP: Account_ResetSecurityQuestion.
    /// </summary>
    Task<bool> ResetSecurityQuestionAsync(
        long userId, short securityQuestionId, string securityAnswer,
        string loggedInUserLoginId, string ipAddress);

    /// <summary>
    /// Changes candidate mobile number.
    /// SP: Account_ChangeCandidateMobileNo.
    /// </summary>
    Task<bool> ChangeCandidateMobileNoAsync(long candidateId, string mobileNo, string userLoginId, string ipAddress);

    /// <summary>
    /// Changes candidate email.
    /// SP: Account_ChangeCandidateEMailID.
    /// </summary>
    Task<bool> ChangeCandidateEmailAsync(long candidateId, string emailId, string userLoginId, string ipAddress);

    /// <summary>
    /// Retrieves security question list for a user.
    /// SP: Account_GetSecurityQuestionDetails.
    /// </summary>
    Task<IEnumerable<SecurityQuestion>> GetSecurityQuestionsAsync(long userId);

    /// <summary>
    /// Resolves the UserID for a given LoginID.
    /// SP: Account_GetUserID.
    /// </summary>
    Task<long> GetUserIdAsync(string userLoginId);
}
