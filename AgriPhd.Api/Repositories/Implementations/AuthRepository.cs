using System.Data;
using Dapper;
using AgriPhd.Api.Models;
using AgriPhd.Api.Repositories.Interfaces;

namespace AgriPhd.Api.Repositories.Implementations;

/// <summary>
/// Dapper implementation of IAuthRepository.
/// Every SP name and @parameter name is preserved exactly from the legacy
/// Admission.Data/Pool/Account/Repository.Account.cs.
/// </summary>
public class AuthRepository : IAuthRepository
{
    private readonly IDbConnection _db;
    private readonly ILogger<AuthRepository> _logger;

    public AuthRepository(IDbConnection db, ILogger<AuthRepository> logger)
    {
        _db = db;
        _logger = logger;
    }

    /// <inheritdoc/>
    public async Task<LoggedInUser?> CheckUserExistsAsync(
        string userLoginId,
        string passwordBase64,
        string browserName,
        string browserVersion,
        string ipAddress)
    {
        _logger.LogInformation("CheckUserExistsAsync called for LoginID={LoginId}", userLoginId);

        var parameters = new DynamicParameters();
        parameters.Add("@UserLoginID", userLoginId);
        parameters.Add("@UserPassword", passwordBase64);
        parameters.Add("@BrowserName", browserName);
        parameters.Add("@BrowserVersion", browserVersion);
        // @IPAddress format: "{Y|N}/{IP}/{Browser}/{Platform}" truncated to 50 chars (legacy Helper.GetUserHostAddress())
        parameters.Add("@IPAddress", Truncate(ipAddress, 50));

        var row = await _db.QueryFirstOrDefaultAsync<dynamic>(
            "Account_CheckUserExists",
            parameters,
            commandType: CommandType.StoredProcedure);

        if (row == null) return null;

        return new LoggedInUser
        {
            IsLoginAllowed       = Convert.ToBoolean(row.IsLoginAllowed ?? false),
            ErrorMessage         = (string?)(row.ErrorMessage) ?? string.Empty,
            UserID               = Convert.ToInt64(row.UserID ?? 0L),
            UserTypeID           = Convert.ToInt32(row.UserTypeID ?? 0),
            UserLoginID          = (string?)(row.UserLoginID) ?? string.Empty,
            UserName             = (string?)(row.UserName) ?? string.Empty,
            DashBoardPath        = (string?)(row.DashBoardPath) ?? string.Empty,
            PhotoPath            = (string?)(row.PhotoPath) ?? string.Empty,
            LoggedInSessionID    = Convert.ToInt64(row.LoggedInSessionID ?? 0L),
            IsAdmin              = Convert.ToBoolean(row.IsAdmin ?? false),
            IsMultipleLoginAllowed = Convert.ToBoolean(row.IsMultipleLoginAllowed ?? false),
            LastLoggedInSessionID = Convert.ToInt64(row.LastLoggedInSessionID ?? 0L),
            SecurityQuestionID   = Convert.ToInt16(row.SecurityQuestionID ?? (short)0),
        };
    }

    /// <inheritdoc/>
    public async Task UpdateLoginStatusAsync(long userId, long loggedInSessionId)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@UserID", userId);
        parameters.Add("@LoggedInSessionID", loggedInSessionId);

        await _db.ExecuteAsync(
            "Account_UpdateLoginStatus",
            parameters,
            commandType: CommandType.StoredProcedure);
    }

    /// <inheritdoc/>
    public async Task UpdateLogoutStatusAsync(long userId, long loggedInSessionId)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@UserID", userId);
        parameters.Add("@LoggedInSessionID", loggedInSessionId);

        await _db.ExecuteAsync(
            "Account_UpdateLogoutStatus",
            parameters,
            commandType: CommandType.StoredProcedure);
    }

    /// <inheritdoc/>
    public async Task<bool> IsCurrentLoginValidAsync(long userId, long loggedInSessionId)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@UserID", userId);
        parameters.Add("@LoggedInSessionID", loggedInSessionId);

        var result = await _db.ExecuteScalarAsync<object>(
            "Account_IsCurrentLoginValid",
            parameters,
            commandType: CommandType.StoredProcedure);

        return Convert.ToBoolean(result);
    }

    /// <inheritdoc/>
    public async Task<string?> GetUserPasswordAsync(string userLoginId)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@UserLoginID", userLoginId);

        return await _db.ExecuteScalarAsync<string?>(
            "Account_GetUserPassword",
            parameters,
            commandType: CommandType.StoredProcedure);
    }

    /// <inheritdoc/>
    public async Task<bool> ResetPasswordAsync(
        long userId, string newPasswordHashed, string loggedInUserLoginId, string ipAddress)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@UserID", userId);
        parameters.Add("@NewPassword", newPasswordHashed);
        parameters.Add("@LoggedInUserLoginID", loggedInUserLoginId);
        parameters.Add("@IPAddress", ipAddress);

        var result = await _db.ExecuteScalarAsync<string>(
            "Account_ResetPassword",
            parameters,
            commandType: CommandType.StoredProcedure);

        return result?.ToUpperInvariant() != "N";
    }

    /// <inheritdoc/>
    public async Task<(bool success, string errorMessage)> CheckForgotPasswordBySecurityQuestionAsync(
        string userLoginId, short securityQuestionId, string securityAnswer)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@UserLoginID", userLoginId);
        parameters.Add("@SecurityQuestionID", securityQuestionId);
        parameters.Add("@SecurityQuestionAnswer", securityAnswer);

        var row = await _db.QueryFirstOrDefaultAsync<dynamic>(
            "Account_CheckForgotPassword",
            parameters,
            commandType: CommandType.StoredProcedure);

        if (row == null)
            return (false, "Account not found.");

        string errorMessage = (string?)(row.ErrorMessage) ?? string.Empty;
        bool success = string.IsNullOrWhiteSpace(errorMessage);
        return (success, errorMessage);
    }

    /// <inheritdoc/>
    public async Task<(bool found, string userLoginId, string errorMessage)> CheckForgotPasswordByOtpLookupAsync(
        string userLoginId, string emailId, string mobileNo)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@UserLoginID", userLoginId);
        parameters.Add("@EMailID", emailId ?? string.Empty);
        parameters.Add("@MobileNo", mobileNo ?? string.Empty);

        var row = await _db.QueryFirstOrDefaultAsync<dynamic>(
            "Account_CheckForgotPasswordByOTP",
            parameters,
            commandType: CommandType.StoredProcedure);

        if (row == null)
            return (false, string.Empty, "Account not found.");

        string loginId = (string?)(row.UserLoginID) ?? string.Empty;
        string errorMsg = (string?)(row.ErrorMessage) ?? string.Empty;
        bool found = string.IsNullOrWhiteSpace(errorMsg);
        return (found, loginId, errorMsg);
    }

    /// <inheritdoc/>
    public async Task<bool> ResetSecurityQuestionAsync(
        long userId, short securityQuestionId, string securityAnswer,
        string loggedInUserLoginId, string ipAddress)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@UserID", userId);
        parameters.Add("@SecurityQuestionID", securityQuestionId);
        parameters.Add("@SecurityQuestionAnswer", securityAnswer);
        parameters.Add("@UserLoginID", loggedInUserLoginId);
        parameters.Add("@IPAddress", ipAddress);

        var result = await _db.ExecuteScalarAsync<string>(
            "Account_ResetSecurityQuestion",
            parameters,
            commandType: CommandType.StoredProcedure);

        return result?.ToUpperInvariant() != "N";
    }

    /// <inheritdoc/>
    public async Task<bool> ChangeCandidateMobileNoAsync(
        long candidateId, string mobileNo, string userLoginId, string ipAddress)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@CandidateID", candidateId);
        parameters.Add("@MobileNo", mobileNo);
        parameters.Add("@UserLoginID", userLoginId);
        parameters.Add("@IPAddress", ipAddress);

        var result = await _db.ExecuteScalarAsync<string>(
            "Account_ChangeCandidateMobileNo",
            parameters,
            commandType: CommandType.StoredProcedure);

        return result?.ToUpperInvariant() != "N";
    }

    /// <inheritdoc/>
    public async Task<bool> ChangeCandidateEmailAsync(
        long candidateId, string emailId, string userLoginId, string ipAddress)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@CandidateID", candidateId);
        parameters.Add("@EMailID", emailId);
        parameters.Add("@UserLoginID", userLoginId);
        parameters.Add("@IPAddress", ipAddress);

        var result = await _db.ExecuteScalarAsync<string>(
            "Account_ChangeCandidateEMailID",
            parameters,
            commandType: CommandType.StoredProcedure);

        return result?.ToUpperInvariant() != "N";
    }

    /// <inheritdoc/>
    public async Task<IEnumerable<SecurityQuestion>> GetSecurityQuestionsAsync(long userId)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@UserID", userId);

        var rows = await _db.QueryAsync<dynamic>(
            "Account_GetSecurityQuestionDetails",
            parameters,
            commandType: CommandType.StoredProcedure);

        return rows.Select(r => new SecurityQuestion
        {
            SecurityQuestionID   = Convert.ToInt16(r.SecurityQuestionID ?? 0),
            SecurityQuestionText = (string?)(r.SecurityQuestionText) ?? string.Empty,
        });
    }

    /// <inheritdoc/>
    public async Task<long> GetUserIdAsync(string userLoginId)
    {
        var parameters = new DynamicParameters();
        parameters.Add("@UserLoginID", userLoginId);

        var result = await _db.ExecuteScalarAsync<object>(
            "Account_GetUserID",
            parameters,
            commandType: CommandType.StoredProcedure);

        return Convert.ToInt64(result ?? 0L);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private static string Truncate(string value, int maxLength) =>
        value.Length <= maxLength ? value : value[..maxLength];
}
