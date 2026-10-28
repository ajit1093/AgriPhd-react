CREATE   PROCEDURE [dbo].[Account_ResetSecurityQuestion]
	@UserID BIGINT,
	@SecurityQuestionID SMALLINT,
	@SecurityQuestionAnswer VARCHAR(50),
	@UserLoginID VARCHAR(50),
	@IPAddress VARCHAR(50)
AS
	DECLARE @IsDone	VARCHAR(500) = 'N'

	BEGIN TRY
		BEGIN TRAN

		UPDATE Master_User
		SET SecurityQuestionID = @SecurityQuestionID, SecurityQuestionAnswer = @SecurityQuestionAnswer, ModifiedDateTime = dbo.fnGetISTDateTime(), ModifiedBy = @UserLoginID, ModifiedByIPAddress = @IPAddress
		WHERE UserID = @UserID

		INSERT INTO Master_User_History (UserID, SecurityQuestionID, SecurityQuestionAnswer, ModifiedDateTime, ModifiedBy, ModifiedByIPAddress)
		SELECT UserID, SecurityQuestionID, SecurityQuestionAnswer, ModifiedDateTime, ModifiedBy, ModifiedByIPAddress FROM Master_User (NOLOCK) WHERE UserID = @UserID

		COMMIT TRAN
		SET @IsDone = 'Y'
	END TRY
	BEGIN CATCH
		IF(@@TRANCOUNT > 0)
			ROLLBACK TRAN
			
		SET @IsDone = 'N'
		 
		INSERT INTO Log_ErrorDetails(LogSource, ErrorMessage, LogDate, UserLoginID)
		VALUES(ERROR_PROCEDURE(), ERROR_MESSAGE(), dbo.fnGetISTDateTime(), @UserLoginID) 
	END CATCH
 
	SELECT @IsDone AS IsOk
