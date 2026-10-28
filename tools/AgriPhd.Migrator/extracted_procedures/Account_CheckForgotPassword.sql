CREATE PROCEDURE [dbo].[Account_CheckForgotPassword]
	@UserLoginID VARCHAR(50),
	@SecurityQuestionID SMALLINT,
	@SecurityQuestionAnswer VARCHAR(50)
AS
	IF EXISTS (SELECT 1 FROM Master_User (NOLOCK) WHERE UserLoginID = @UserLoginID AND SecurityQuestionID = @SecurityQuestionID AND SecurityQuestionAnswer = @SecurityQuestionAnswer)
		BEGIN
			SELECT UserLoginID, ErrorMessage = ''
			FROM Master_User (NOLOCK) 
			WHERE UserLoginID = @UserLoginID AND SecurityQuestionID = @SecurityQuestionID AND SecurityQuestionAnswer = @SecurityQuestionAnswer
		END
	ELSE
		BEGIN
			SELECT 
				UserLoginID =	'', 
				ErrorMessage = 'Current Combination of Login ID / User Name, Security Question and it''s Answer not matched. Please enter valid details.' 
			END
