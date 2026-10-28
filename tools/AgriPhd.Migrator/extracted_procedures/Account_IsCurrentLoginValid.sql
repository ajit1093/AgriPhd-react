CREATE PROCEDURE [dbo].[Account_IsCurrentLoginValid]
	@UserID BIGINT,
	@LoggedInSessionID BIGINT
AS
	IF EXISTS (SELECT 1 FROM Master_User (NOLOCK) WHERE UserID = @UserID AND LoggedInSessionID = @LoggedInSessionID)
		BEGIN
			SELECT 1
		END
	ELSE
		BEGIN
			SELECT 0
		END
