
CREATE PROCEDURE [dbo].[Account_UpdateLoginStatus]
	@UserID BIGINT,
	@LoggedInSessionID BIGINT
AS
	UPDATE Master_User
	SET LoggedInSessionID = @LoggedInSessionID, LastLoginDateTime = CurrentLoginDateTime, CurrentLoginDateTime = dbo.fnGetISTDateTime()
	WHERE UserID = @UserID
