CREATE PROCEDURE [dbo].[Account_GetUserID]
	@UserLoginID VARCHAR(50)
AS  
	SELECT UserID FROM Master_User (NOLOCK) WHERE UserLoginID = @UserLoginID

