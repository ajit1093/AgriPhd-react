
CREATE   PROCEDURE [dbo].[Account_GetUserListForPasswordGeneration]
	@UserTypeID INT
AS
	SELECT UserID, UserPassword FROM Master_User (NOLOCK) WHERE UserTypeID = @UserTypeID AND LEN(UserPassword) = 0
