CREATE PROCEDURE [dbo].[Account_UpdateUserPassword]
	@UserID BIGINT,
	@UserPassword VARCHAR(250),
	@UserLoginID VARCHAR(50),
	@IPAddress VARCHAR(50)
AS
	UPDATE Master_User 
	SET UserPassword = @UserPassword, ModifiedDateTime = dbo.fnGetISTDateTime(), ModifiedBy = @UserLoginID, ModifiedByIPAddress = @IPAddress
	WHERE UserID = @UserID AND LEN(UserPassword) = 0
