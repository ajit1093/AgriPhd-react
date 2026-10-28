
CREATE   PROCEDURE [dbo].[Base_GetOTP]
	@MobileNo VARCHAR(100),
	@Purpose VARCHAR(50),
	@OTP VARCHAR(10)
AS
	IF NOT EXISTS (SELECT 1 FROM Message_OTPDetails (NOLOCK) WHERE MobileNo = @MobileNo AND Purpose = @Purpose AND IsOTPVerified = 0)
		BEGIN
			INSERT INTO Message_OTPDetails (MobileNo, Purpose, OTP)
			VALUES (@MobileNo, @Purpose, @OTP)
		END

	INSERT INTO Message_OTPDetails_History (MobileNo, Purpose, OTP, SentDateTime, IsOTPVerified, OTPVerifiedDateTime)
	SELECT MobileNo, Purpose, OTP, dbo.fnGetISTDateTime(), IsOTPVerified, OTPVerifiedDateTime FROM Message_OTPDetails (NOLOCK) WHERE MobileNo = @MobileNo AND Purpose = @Purpose AND IsOTPVerified = 0

	SELECT OTP FROM Message_OTPDetails (NOLOCK) WHERE MobileNo = @MobileNo AND Purpose = @Purpose AND IsOTPVerified = 0
