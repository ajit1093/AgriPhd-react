CREATE   PROCEDURE [dbo].[ApplicationForm_SaveApplicationFeeDetails]
	@CandidateID BIGINT,
	@UserLoginID VARCHAR(50),  
	@IPAddress VARCHAR(50),      
	@PageCode VARCHAR(50)
AS
	DECLARE @IsEligible	BIT = 0
	DECLARE @ErrMsg	VARCHAR(250) = ''
	DECLARE @IsInnerProcOk BIT = 0
	DECLARE @IsDone	VARCHAR(500) = 'N'
	DECLARE @IsApplicationFeePaid BIT = 0

	BEGIN TRY
		
		SELECT @IsApplicationFeePaid = CASE WHEN RemainingFee > 0 THEN 0 ELSE 1 END FROM dbo.fnCalculateFee(@CandidateID, 99)
		SELECT @IsEligible = ISNULL(IsEligible, 0), @ErrMsg = ErrMsg FROM dbo.fnCheckApplicationFormFillingEligiblity(@CandidateID, @UserLoginID)
		
		IF (@IsEligible = 1)
			BEGIN
				IF (@IsApplicationFeePaid = 1)
					BEGIN
						EXEC ApplicationForm_UpdateStatus @CandidateID, @UserLoginID, @PageCode, @IPAddress, @IsInnerProcOk OUTPUT
                
						IF (@IsInnerProcOk = 1)
							BEGIN                                                                                   
								SET @IsDone = 'Y'
							END 
						ELSE
							BEGIN
								SET @IsDone = 'N'
							END
					END
				ELSE
					BEGIN
						SET @IsDone = 'Your Application Fee is Not Paid.'
					END	
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
		VALUES(ERROR_PROCEDURE(), ERROR_MESSAGE(), dbo.fnGetISTDateTime(), @UserLoginID) 
	END CATCH
 
	SELECT @IsDone AS IsOk

