CREATE   PROCEDURE [dbo].[ApplicationForm_SavePhotoAndSignUploadStatus]
	@CandidateID BIGINT,
	@PhotoUploadedURL VARCHAR(1000),
	@SignUploadedURL VARCHAR(1000),
	@UserLoginID VARCHAR(50),
	@IPAddress VARCHAR(50),
	@PageCode VARCHAR(50)
AS
	DECLARE @IsEligible	BIT = 0
	DECLARE @ErrMsg	VARCHAR(250) = ''
	DECLARE @IsDone	VARCHAR(500) = 'N'
	DECLARE @IsInnerProcOk BIT	= 0

	BEGIN TRY

		SELECT @IsEligible = ISNULL(IsEligible, 0), @ErrMsg = ErrMsg FROM dbo.fnCheckApplicationFormFillingEligiblity(@CandidateID, @UserLoginID)

		IF (@IsEligible = 1)
			BEGIN
				BEGIN TRAN

				IF NOT EXISTS (SELECT 1 FROM ApplicationForm_PhotoAndSignDetails (NOLOCK) WHERE CandidateID = @CandidateID)
					BEGIN
						INSERT INTO ApplicationForm_PhotoAndSignDetails (CandidateID, PhotoUploadedURL, SignUploadedURL, CreatedDateTime, CreatedBy, CreatedByIPAddress)
						VALUES (@CandidateID, @PhotoUploadedURL, @SignUploadedURL, [dbo].[fnGetISTDateTime](), @UserLoginID, @IPAddress)
					END
				ELSE
					BEGIN
						IF (LEN(@PhotoUploadedURL) > 0)
							BEGIN
								UPDATE ApplicationForm_PhotoAndSignDetails
								SET PhotoUploadedURL = @PhotoUploadedURL, ModifiedDateTime = [dbo].[fnGetISTDateTime](), ModifiedBy = @UserLoginID, ModifiedByIPAddress = @IPAddress
								WHERE CandidateID = @CandidateID
							END
						
						IF (LEN(@SignUploadedURL) > 0)
							BEGIN
								UPDATE ApplicationForm_PhotoAndSignDetails
								SET SignUploadedURL = @SignUploadedURL, ModifiedDateTime = [dbo].[fnGetISTDateTime](), ModifiedBy = @UserLoginID, ModifiedByIPAddress = @IPAddress
								WHERE CandidateID = @CandidateID
							END
					END

				INSERT INTO ApplicationForm_PhotoAndSignDetails_History (CandidateID, PhotoUploadedURL, SignUploadedURL, ModifiedDateTime, ModifiedBy, ModifiedByIPAddress)
				SELECT CandidateID, PhotoUploadedURL, SignUploadedURL, [dbo].[fnGetISTDateTime](), @UserLoginID, @IPAddress FROM ApplicationForm_PhotoAndSignDetails (NOLOCK) WHERE CandidateID = @CandidateID
					
				UPDATE ApplicationForm_Status SET VersionNo = VersionNo + 1 WHERE CandidateID = @CandidateID AND FormStatus <> 'I'
				UPDATE ApplicationForm_Status SET LastModifiedOn = dbo.fnGetISTDateTime(), LastModifiedBy = @UserLoginID, LastModifiedByIPAddress = @IPAddress, LastModifiedPage = @PageCode WHERE CandidateID = @CandidateID

				INSERT INTO ApplicationForm_Status_History (CandidateID, VersionNo, StepID, FormStatus, LastModifiedOn, LastModifiedBy, LastModifiedByIPAddress, LastModifiedPage)
				SELECT CandidateID, VersionNo, StepID, FormStatus, LastModifiedOn, LastModifiedBy, LastModifiedByIPAddress, LastModifiedPage FROM ApplicationForm_Status (NOLOCK) WHERE CandidateID = @CandidateID

				INSERT INTO ApplicationForm_History (CandidateID, ApplicationID, VersionNo, StepID, FormStatus, LastModifiedOn, LastModifiedBy, LastModifiedByIPAddress, LastModifiedPage, LockedDateTime, LockedBy, LockedByIPAddress)
				SELECT CandidateID, ApplicationID, VersionNo, StepID, FormStatus, LastModifiedOn, LastModifiedBy, LastModifiedByIPAddress, LastModifiedPage, LockedDateTime, LockedBy, LockedByIPAddress FROM viewApplicationForm (NOLOCK) WHERE CandidateID = @CandidateID

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

