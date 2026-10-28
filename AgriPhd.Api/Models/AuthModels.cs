namespace AgriPhd.Api.Models;

/// <summary>
/// Represents the authenticated user — ported from legacy LoggedInUser (Admission.Entities).
/// Populated by Account_CheckUserExists SP result.
/// </summary>
public class LoggedInUser
{
    public long UserID { get; set; }
    public int UserTypeID { get; set; }
    public string UserLoginID { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string DashBoardPath { get; set; } = string.Empty;
    public string PhotoPath { get; set; } = string.Empty;
    public long LoggedInSessionID { get; set; }
    public bool IsAdmin { get; set; }
    public bool IsMultipleLoginAllowed { get; set; }
    public long LastLoggedInSessionID { get; set; }

    /// <summary>
    /// 0 means not set → force-redirect to ChangeSecurityQuestion before dashboard.
    /// </summary>
    public short SecurityQuestionID { get; set; }

    public string ErrorMessage { get; set; } = string.Empty;
    public bool IsLoginAllowed { get; set; }
}

/// <summary>
/// Ported from ForgotPasswordEntity. Used for all three recovery paths.
/// </summary>
public class ForgotPasswordData
{
    public string UserLoginID { get; set; } = string.Empty;
    public short SecurityQuestionID { get; set; }
    public string SecurityQuestionAnswer { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
    public string ErrorMessage { get; set; } = string.Empty;
    public string IPAddress { get; set; } = string.Empty;
}

/// <summary>
/// Used by Account_ResetPassword SP.
/// </summary>
public class ResetPasswordData
{
    public long UserID { get; set; }
    public string NewPassword { get; set; } = string.Empty;
    public string LoggedInUserLoginID { get; set; } = string.Empty;
    public string IPAddress { get; set; } = string.Empty;
}

/// <summary>
/// SecurityQuestion item for the dropdown list.
/// </summary>
public class SecurityQuestion
{
    public short SecurityQuestionID { get; set; }
    public string SecurityQuestionText { get; set; } = string.Empty;
}
