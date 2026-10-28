
CREATE PROCEDURE [dbo].[Account_GetLoggedInUserDetails]
	@UserTypeID INT,
	@UserLoginID VARCHAR(50)
AS
	SELECT 
		A.UserLoginID, B.UserType, A.UserName, A.CurrentLoginDateTime, A.LastLoginDateTime, '' AS CollegeName
	FROM 
		Master_User (NOLOCK) A
		INNER JOIN Master_UserType (NOLOCK) B ON A.UserTypeID = B.UserTypeID
	WHERE 
		A.UserLoginID = @UserLoginID
