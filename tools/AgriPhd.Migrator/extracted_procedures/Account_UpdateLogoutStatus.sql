
CREATE PROCEDURE [dbo].[Account_UpdateLogoutStatus]
	@UserID BIGINT,
	@LoggedInSessionID BIGINT
AS
	UPDATE Master_User SET LoggedInSessionID = 0 WHERE UserID = @UserID
	UPDATE Log_LoginDetails SET LogOutDateTime = dbo.fnGetISTDateTime() WHERE SessionID = @LoggedInSessionID
