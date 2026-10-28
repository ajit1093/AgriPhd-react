using System.Data;
using Dapper;
using AgriPhd.Api.Models;
using AgriPhd.Api.Repositories.Interfaces;

namespace AgriPhd.Api.Repositories.Implementations;

/// <summary>
/// Dapper implementation. SP names and @parameter names confirmed from
/// Repository.Registration.cs and Repository.Base.cs.
/// </summary>
public class RegistrationRepository : IRegistrationRepository
{
    private readonly IDbConnection _db;
    public RegistrationRepository(IDbConnection db) => _db = db;

    public async Task<CandidateLookupResult?> GetRegisteredCandidateAsync(
        long applicationFormNo, string dob)
    {
        var p = new DynamicParameters();
        p.Add("@ApplicationFormNo", applicationFormNo);
        // @DOB passed as raw string — confirmed from legacy code (no DateTime conversion)
        p.Add("@DOB", dob);

        var row = await _db.QueryFirstOrDefaultAsync<dynamic>(
            "ApplicationForm_GetRegisteredCandidate", p,
            commandType: CommandType.StoredProcedure);

        if (row == null) return null;

        return new CandidateLookupResult
        {
            CandidateName     = S(row.CandidateName),
            FacultyName       = S(row.FacultyName),
            ApplicationFormNo = Convert.ToInt64(row.ApplicationFormNo ?? 0L),
            SeatNo            = Convert.ToInt64(row.SeatNo            ?? 0L),
            CETScore          = Convert.ToDecimal(row.CETScore        ?? 0m),
            DOB               = S(row.DOB),
            LoginExists       = Convert.ToBoolean(row.LoginExists      ?? false),
            MobileNo          = S(row.MobileNo),
            // Column name in SP result is 'emailID' (lowercase e) — confirmed from RegistrationWorker
            EmailId           = S(row.emailID),
            PGSubjectName     = S(row.PGSubjectName),
        };
    }

    public async Task<bool> IsMobileAlreadyRegisteredAsync(string mobileNo)
    {
        var p = new DynamicParameters();
        p.Add("@CandidateID", 0L); // always 0 for new registration
        p.Add("@MobileNo",    mobileNo);
        var result = await _db.ExecuteScalarAsync<object>(
            "ApplicationForm_IsApplicationFormAlreadyRegisteredUsingThisMobileNo", p,
            commandType: CommandType.StoredProcedure);
        return Convert.ToBoolean(result);
    }

    public async Task<bool> IsEmailAlreadyRegisteredAsync(string emailId)
    {
        var p = new DynamicParameters();
        p.Add("@CandidateID", 0L);
        p.Add("@EMailID",     emailId);
        var result = await _db.ExecuteScalarAsync<object>(
            "ApplicationForm_IsApplicationFormAlreadyRegisteredUsingThisEMailID", p,
            commandType: CommandType.StoredProcedure);
        return Convert.ToBoolean(result);
    }

    public async Task<string> RegisterCandidateAsync(
        long   applicationFormNo, string candidateName, string fatherName,
        string genderCode, string dob, string mobileNo, string emailId,
        short  securityQuestionId, string securityAnswer,
        string passwordBase64, string ipAddress)
    {
        var p = new DynamicParameters();
        p.Add("@ApplicationFormNo",    applicationFormNo);
        p.Add("@CandidateName",        candidateName);
        p.Add("@FatherName",           fatherName);       // always "" per legacy
        p.Add("@GenderCode",           genderCode);
        p.Add("@DOB",                  dob);
        p.Add("@MobileNo",             mobileNo);
        p.Add("@EMailID",              emailId);
        p.Add("@SecurityQuestionID",   securityQuestionId);
        p.Add("@SecurityQuestionAnswer", securityAnswer);
        p.Add("@Password",             passwordBase64);
        p.Add("@UserLoginID",          "");  // always empty — confirmed from legacy
        p.Add("@IPAddress",            ipAddress);
        p.Add("@PageCode",             "Registration");

        var result = await _db.ExecuteScalarAsync<string>(
            "ApplicationForm_RegisterCandidate", p,
            commandType: CommandType.StoredProcedure);

        return result ?? "N";
    }

    public async Task<string> GetOtpAsync(string recipient, string purpose, string otp)
    {
        var p = new DynamicParameters();
        p.Add("@MobileNo", recipient); // email address also passed as @MobileNo — confirmed from legacy
        p.Add("@Purpose",  purpose);
        p.Add("@OTP",      otp);

        var result = await _db.ExecuteScalarAsync<string>(
            "Base_GetOTP", p, commandType: CommandType.StoredProcedure);

        return result ?? otp;
    }

    public async Task<bool> VerifyOtpAsync(string recipient, string purpose, string otp)
    {
        var p = new DynamicParameters();
        p.Add("@MobileNo", recipient);
        p.Add("@Purpose",  purpose);
        p.Add("@OTP",      otp);

        var result = await _db.ExecuteScalarAsync<string>(
            "Base_SaveOTPVerificationStatus", p,
            commandType: CommandType.StoredProcedure);

        return result?.ToUpperInvariant() == "Y";
    }

    public async Task<EmailSmsTemplate?> GetEmailSmsTemplateAsync(
        string purpose, string messageType,
        string param1 = "", string param2 = "",
        string param3 = "", string param4 = "", string param5 = "")
    {
        var p = new DynamicParameters();
        p.Add("@Purpose",     purpose);
        p.Add("@MessageType", messageType);
        p.Add("@Param1",      param1);
        // Legacy BaseWorker bug: @Param2 receives Param1 value — preserved faithfully
        p.Add("@Param2",      param1);
        p.Add("@Param3",      param3);
        p.Add("@Param4",      param4);
        p.Add("@Param5",      param5);

        var row = await _db.QueryFirstOrDefaultAsync<dynamic>(
            "Base_GetEMailSMS", p, commandType: CommandType.StoredProcedure);

        if (row == null) return null;

        return new EmailSmsTemplate
        {
            EmailId    = S(row.EMailID),
            Subject    = S(row.Subject),
            Message    = S(row.Message),
            MobileNo   = S(row.MobileNo),
            TemplateId = S(row.TemplateID),
            Var1       = S(row.VAR1 ?? row.Var1),
            Var2       = S(row.Var2),
            Var3       = S(row.Var3),
            Var4       = S(row.Var4),
            Var5       = S(row.Var5),
        };
    }

    private static string S(object? v) => Convert.ToString(v ?? "") ?? "";
}
