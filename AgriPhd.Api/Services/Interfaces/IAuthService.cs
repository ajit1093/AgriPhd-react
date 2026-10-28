using AgriPhd.Api.DTOs.Requests;
using AgriPhd.Api.DTOs.Responses;
using AgriPhd.Api.Models;

namespace AgriPhd.Api.Services.Interfaces;

public interface IAuthService
{
    /// <summary>
    /// Validates credentials. Handles Base64→bcrypt transparent migration.
    /// Returns the logged-in user on success; error message on failure.
    /// </summary>
    Task<(LoggedInUser? user, string errorMessage)> LoginAsync(
        LoginRequest request, string browserName, string browserVersion, string ipAddress);

    Task LogoutAsync(long userId, long sessionId);

    Task<bool> IsCurrentLoginValidAsync(long userId, long sessionId);

    Task<(bool success, string errorMessage)> ChangePasswordAsync(
        long userId, string userLoginId, ChangePasswordRequest request, string ipAddress);

    Task<(bool success, string errorMessage)> ChangeSecurityQuestionAsync(
        long userId, string userLoginId, ChangeSecurityQuestionRequest request, string ipAddress);

    Task<(bool success, string errorMessage)> ResetPasswordAsync(
        ResetPasswordRequest request, string loggedInUserLoginId, string ipAddress);

    Task<(bool success, string errorMessage)> ForgotPasswordBySecurityQuestionAsync(
        ForgotPasswordBySecurityQuestionRequest request);

    Task<(bool found, string userLoginId, string errorMessage)> ForgotPasswordOtpLookupAsync(
        ForgotPasswordByOtpRequest request);

    Task<IEnumerable<SecurityQuestionResponse>> GetSecurityQuestionsAsync(long userId);

    Task<(bool success, string errorMessage)> ChangeCandidateMobileNoAsync(
        long candidateId, string userLoginId, ChangeMobileRequest request, string ipAddress);

    Task<(bool success, string errorMessage)> ChangeCandidateEmailAsync(
        long candidateId, string userLoginId, ChangeEmailRequest request, string ipAddress);
}
