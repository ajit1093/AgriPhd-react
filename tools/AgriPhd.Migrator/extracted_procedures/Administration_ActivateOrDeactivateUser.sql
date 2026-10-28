CREATE PROCEDURE [dbo].[Administration_ActivateOrDeactivateUser]
	@UserID BIGINT,
	@ModifiedBy VARCHAR(50),
	@ModifiedByIPAddress VARCHAR(50)
AS
	DECLARE @IsDone	VARCHAR(500) = 'N'

	BEGIN TRY
		BEGIN TRAN

		UPDATE Master_User
		SET IsActive = CASE IsActive WHEN 0 THEN 1 ELSE 0 END, ModifiedDateTime = dbo.fnGetISTDateTime(), ModifiedBy = @ModifiedBy, ModifiedByIPAddress = @ModifiedByIPAddress
		WHERE UserID = @UserID

		INSERT INTO Master_User_History (UserID, IsActive, ModifiedDateTime, ModifiedBy, ModifiedByIPAddress)
		SELECT UserID, IsActive, ModifiedDateTime, ModifiedBy, ModifiedByIPAddress FROM Master_User (NOLOCK) WHERE UserID = @UserID

		COMMIT TRAN
		SET @IsDone = 'Y'
	END TRY
	BEGIN CATCH
		IF(@@TRANCOUNT > 0)
			ROLLBACK TRAN
			
		SET @IsDone = 'N'
		 
		INSERT INTO Log_ErrorDetails(LogSource, ErrorMessage, LogDate, UserLoginID)
		VALUES(ERROR_PROCEDURE(), ERROR_MESSAGE(), dbo.fnGetISTDateTime(), @ModifiedBy) 
	END CATCH
 
	SELECT @IsDone AS IsOk
