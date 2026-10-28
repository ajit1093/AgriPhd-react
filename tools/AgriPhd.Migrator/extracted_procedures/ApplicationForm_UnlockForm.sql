CREATE   PROCEDURE [dbo].[ApplicationForm_UnlockForm]
	@CandidateID BIGINT,
	@UserLoginID VARCHAR(50),
	@IPAddress VARCHAR(50),
	@PageCode VARCHAR(50)
AS
	DECLARE @IsEligible BIT = 0
	DECLARE @ErrMsg VARCHAR(250) = ''
	DECLARE @IsInnerProcOk BIT = 0
	DECLARE @IsDone VARCHAR(500) = 'N'

	BEGIN TRY
		SELECT @IsEligible = IsEligible, @ErrMsg = ErrMsg FROM dbo.fnCheckApplicationFormUnlockEligiblity(@CandidateID, @UserLoginID)

		IF (@IsEligible = 1)
			BEGIN
				BEGIN TRAN

				UPDATE ApplicationForm_ConfirmationDetails
				SET IsConfirmed = 0, CancelledDateTime = dbo.fnGetISTDateTime(), CancelledBy = @UserLoginID, CancelledByIPAddress = @IPAddress, ModifiedDateTime = dbo.fnGetISTDateTime(), ModifiedBy = @UserLoginID, ModifiedByIPAddress = @IPAddress
				WHERE CandidateID = @CandidateID
						
				INSERT INTO ApplicationForm_ConfirmationDetails_History (CandidateID, IsConfirmed, ConfirmedDateTime, ConfirmedBy, ConfirmedByIPAddress, CancelledDateTime, CancelledBy, CancelledByIPAddress, ModifiedDateTime, ModifiedBy, ModifiedByIPAddress)
				SELECT CandidateID, IsConfirmed, ConfirmedDateTime, ConfirmedBy, ConfirmedByIPAddress, CancelledDateTime, CancelledBy, CancelledByIPAddress, dbo.fnGetISTDateTime(), @UserLoginID, @IPAddress FROM ApplicationForm_ConfirmationDetails (NOLOCK) WHERE CandidateID = @CandidateID

				UPDATE ApplicationForm_Status
				SET StepID = StepID - 1, FormStatus = 'C', IsFullyEVerified = 0, LastModifiedOn = dbo.fnGetISTDateTime(), LastModifiedBy	= @UserLoginID, LastModifiedByIPAddress = @IPAddress, LastModifiedPage = 'ApplicationFormUnlock'	
				WHERE CandidateID = @CandidateID AND FormStatus = 'A'

				INSERT INTO ApplicationForm_Status_History (CandidateID, VersionNo, StepID, FormStatus, LastModifiedOn, LastModifiedBy, LastModifiedByIPAddress, LastModifiedPage)
				SELECT CandidateID, VersionNo, StepID, FormStatus, LastModifiedOn, LastModifiedBy, LastModifiedByIPAddress, LastModifiedPage FROM ApplicationForm_Status (NOLOCK) WHERE CandidateID = @CandidateID
				
				COMMIT TRAN
				SET @IsDone = 'Y'
			END
		ELSE
			BEGIN
				SET @IsDone = @ErrMsg
			END
	END TRY
	BEGIN CATCH
		IF(@@TRANCOUNT > 0)
			ROLLBACK TRAN
			
		SET @IsDone = 'N'
		 
		INSERT INTO Log_ErrorDetails(LogSource, ErrorMessage, LogDate, UserLoginID)
		VALUES(ERROR_PROCEDURE(), ERROR_MESSAGE() + ' AT ' + CAST(ERROR_LINE() AS VARCHAR(10)) + ' For Form No '  + CAST(@CandidateID AS VARCHAR(20)) , [dbo].[fnGetISTDateTime](), @UserLoginID) 
	END CATCH
 
	SELECT @IsDone AS IsOk

