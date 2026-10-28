CREATE PROCEDURE [dbo].[Account_GetSecurityQuestionDetails]
	@UserID BIGINT
AS
	SELECT 
		SecurityQuestionID, SecurityQuestionAnswer
	FROM
		Master_User (NOLOCK)
	WHERE
		UserID = @UserID
