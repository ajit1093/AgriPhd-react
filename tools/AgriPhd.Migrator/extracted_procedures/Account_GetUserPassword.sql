
CREATE PROCEDURE [dbo].[Account_GetUserPassword]
	@UserLoginID VARCHAR(50)
AS  
	SELECT UserPassword FROM Master_User (NOLOCK) WHERE UserLoginID = @UserLoginID
