CREATE   PROCEDURE [dbo].[Account_CheckForgotPasswordByOTP]
	@UserLoginID VARCHAR(50),
	@EMailID VARCHAR(100),
	@MobileNo VARCHAR(10)
AS
	IF (LEN(@EMailID) > 0)
		BEGIN
			IF EXISTS (SELECT 1 FROM Master_User (NOLOCK) WHERE UserLoginID = @UserLoginID AND UserEmailID = @EMailID)
				BEGIN
					SELECT UserLoginID, ErrorMessage = ''
					FROM Master_User (NOLOCK) 
					WHERE UserLoginID = @UserLoginID AND UserEMailID = @EMailID
				END
			ELSE
				BEGIN
					SELECT 
						UserLoginID =	'', 
						ErrorMessage = 'Current Combination of Login ID / User Name and Registered E-Mail ID not matched. Please enter valid details.' 
					END
		END
	ELSE IF (LEN(@MobileNo) > 0)
		BEGIN
			IF EXISTS (SELECT 1 FROM Master_User (NOLOCK) WHERE UserLoginID = @UserLoginID AND UserMobileNo = @MobileNo)
				BEGIN
					SELECT UserLoginID, ErrorMessage = ''
					FROM Master_User (NOLOCK) 
					WHERE UserLoginID = @UserLoginID AND UserMobileNo = @MobileNo
				END
			ELSE
				BEGIN
					SELECT 
						UserLoginID =	'', 
						ErrorMessage = 'Current Combination of Login ID / User Name and Registered Mobile Number not matched. Please enter valid details.' 
					END
		END	

