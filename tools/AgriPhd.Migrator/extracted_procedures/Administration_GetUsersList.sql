CREATE   PROCEDURE [dbo].[Administration_GetUsersList]
	@UserTypeID INT
AS
	SELECT 
		A.UserID, A.UserTypeID, B.UserType, A.UserLoginID, A.UserPassword, A.UserName, A.UserMobileNo, A.UserEMailID,
		CASE A.IsActive WHEN 1 THEN 'Active' ELSE 'Deactive' END AS IsActive,
		CASE A.IsActive WHEN 1 THEN 'Deactivate' ELSE 'Activate' END AS ActivOrDeactive
	FROM
		Master_User (NOLOCK) A
		INNER JOIN Master_UserType (NOLOCK) B ON A.UserTypeID = B.UserTypeID
	WHERE
		A.UserTypeID = @UserTypeID
	ORDER BY
		A.UserID
