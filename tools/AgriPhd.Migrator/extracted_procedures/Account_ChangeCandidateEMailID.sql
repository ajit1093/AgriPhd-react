CREATE   PROCEDURE [dbo].[Account_ChangeCandidateEMailID]
	@CandidateID BIGINT, 
	@EMailID VARCHAR(100), 
	@UserLoginID VARCHAR(50), 
	@IPAddress VARCHAR(50)
AS
	BEGIN TRY 
		BEGIN TRAN 

		DECLARE @IsDone	CHAR(1) = 'N'

		UPDATE ApplicationForm_RegistrationDetails
		SET EMailID = @EMailID, ModifiedDateTime = dbo.fnGetISTDateTime(), ModifiedBy = @UserLoginID, ModifiedByIPAddress = @IPAddress
		WHERE CandidateID = @CandidateID

		UPDATE Master_User
		SET UserEMailID = @EMailID, ModifiedDateTime = dbo.fnGetISTDateTime(), ModifiedBy = @UserLoginID, ModifiedByIPAddress = @IPAddress
		WHERE UserID = @CandidateID

		INSERT INTO ApplicationForm_RegistrationDetails_History (CandidateID, EMailID, ModifiedDateTime, ModifiedBy, ModifiedByIPAddress)
		SELECT CandidateID, EMailID, dbo.fnGetISTDateTime(), @UserLoginID, @IPAddress FROM ApplicationForm_RegistrationDetails (NOLOCK) WHERE CandidateID = @CandidateID

		INSERT INTO Master_User_History (UserID, UserEmailID, ModifiedDateTime, ModifiedBy, ModifiedByIPAddress)
		SELECT UserID, UserEmailID, dbo.fnGetISTDateTime(), @UserLoginID, @IPAddress FROM Master_User (NOLOCK) WHERE UserID = @CandidateID

		COMMIT TRAN 
		SET @IsDone = 'Y'
	END TRY
	BEGIN CATCH
		IF(@@TRANCOUNT > 0)
			ROLLBACK TRAN
					
		SET @IsDone = 'N'
						
		INSERT INTO Log_ErrorDetails(LogSource, ErrorMessage, LogDate, UserLoginID)
		VALUES(ERROR_PROCEDURE(), ERROR_MESSAGE() + ' AT ' + CAST(ERROR_LINE() AS VARCHAR(10)) + ' For Form No '  + CAST(@CandidateID AS VARCHAR(20)), dbo.fnGetISTDateTime(), @UserLoginID) 
	END CATCH

	SELECT @IsDone AS IsOk

