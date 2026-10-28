CREATE   PROCEDURE [dbo].[Base_SaveOTPVerificationStatus]
	@MobileNo VARCHAR(100),
	@Purpose VARCHAR(50),
	@OTP VARCHAR(10)
AS
	DECLARE @IsDone VARCHAR(500) = 'N'

	BEGIN TRY
		IF EXISTS (SELECT 1 FROM Message_OTPDetails (NOLOCK) WHERE MobileNo = @MobileNo AND Purpose = @Purpose AND OTP = @OTP)
			BEGIN
				UPDATE Message_OTPDetails 
				SET IsOTPVerified = 1, OTPVerifiedDateTime = dbo.fnGetISTDateTime()
				WHERE MobileNo = @MobileNo AND Purpose = @Purpose AND OTP = @OTP

				INSERT INTO Message_OTPDetails_History (MobileNo, Purpose, OTP, SentDateTime, IsOTPVerified, OTPVerifiedDateTime)
				SELECT MobileNo, Purpose, OTP, dbo.fnGetISTDateTime(), IsOTPVerified, OTPVerifiedDateTime FROM Message_OTPDetails (NOLOCK) WHERE MobileNo = @MobileNo AND Purpose = @Purpose AND OTP = @OTP

				SET @IsDone = 'Y'
			END
		ELSE
			BEGIN
				SET @IsDone = 'N'
			END
	END TRY
	BEGIN CATCH
		IF(@@TRANCOUNT > 0)
			ROLLBACK TRAN
			
		SET @IsDone = 'N'
		 
		INSERT INTO Log_ErrorDetails(LogSource, ErrorMessage, LogDate, UserLoginID)
		VALUES(ERROR_PROCEDURE(), ERROR_MESSAGE(), dbo.fnGetISTDateTime(), '') 
	END CATCH
	
	SELECT @IsDone AS IsOk

