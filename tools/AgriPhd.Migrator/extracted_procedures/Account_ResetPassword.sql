CREATE   PROCEDURE [dbo].[Account_ResetPassword]
	@UserID BIGINT,
	@NewPassword VARCHAR(250),
	@LoggedInUserLoginID VARCHAR(50),	
	@IPAddress VARCHAR(50)
AS
	DECLARE @IsDone	VARCHAR(500) = 'N'

	BEGIN TRY 
		BEGIN TRAN 

		IF EXISTS (SELECT 1 FROM Master_User (NOLOCK) A WHERE A.UserID = @UserID)
			BEGIN
				UPDATE Master_User
				SET UserPassword = @NewPassword, ModifiedDateTime = dbo.fnGetISTDateTime(), ModifiedBy = @LoggedInUserLoginID, ModifiedByIPAddress = @IPAddress
				WHERE UserID = @UserID

				INSERT INTO Master_User_History (UserID, UserTypeID, UserLoginID, UserPassword, SecurityQuestionID, SecurityQuestionAnswer, CurrentLoginDateTime, LastLoginDateTime, IsActive, ModifiedDateTime, ModifiedBy, ModifiedByIPAddress)
				SELECT UserID, UserTypeID, UserLoginID, UserPassword, SecurityQuestionID, SecurityQuestionAnswer, CurrentLoginDateTime, LastLoginDateTime, IsActive, dbo.fnGetISTDateTime(), @LoggedInUserLoginID, @IPAddress FROM Master_user (NOLOCK) WHERE UserID = @UserID

				COMMIT TRAN 
				SET @IsDone = 'Y'
			END
		ELSE
			BEGIN
				ROLLBACK TRAN
				SET @IsDone = 'User Not Exists.'
			END 
	END TRY
	BEGIN CATCH
		IF(@@TRANCOUNT > 0)
			ROLLBACK TRAN
					
		SET @IsDone = 'N'
						
		INSERT INTO Log_ErrorDetails(LogSource, ErrorMessage, LogDate, UserLoginID)
		VALUES(ERROR_PROCEDURE(), ERROR_MESSAGE(), dbo.fnGetISTDateTime(), @LoggedInUserLoginID) 
	END CATCH

	SELECT @IsDone AS IsOk
