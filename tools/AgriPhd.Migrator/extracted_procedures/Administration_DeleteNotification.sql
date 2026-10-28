CREATE   PROCEDURE [dbo].[Administration_DeleteNotification]
	@NotificationID INT,
	@UserLoginID VARCHAR(50),
	@IPAddress VARCHAR(50)
AS
	DECLARE @IsDone VARCHAR(500) = 'N'

	BEGIN TRY
		BEGIN TRAN

		UPDATE Administration_NotificationDetails
		SET IsDeleted = 1, ModifiedDateTime = dbo.fnGetISTDateTime(), ModifiedBy = @UserLoginID, ModifiedByIPAddress = @IPAddress
		WHERE NotificationID = @NotificationID

		INSERT INTO Administration_NotificationDetails_History (NotificationID, NotificationCategoryID, NotificationTitle, NotificationTitleMarathi, DisplayStartDateTime, DisplayEndDateTime, PublishDateTime, ContentType, TextContent, TextContentMarathi, FileContentName, FileContentURL, OpenInNewPage, DisplayNewImage, IsActive, IsDeleted, RegionID, ModifiedDateTime, ModifiedBy, ModifiedByIPAddress)
		SELECT NotificationID, NotificationCategoryID, NotificationTitle, NotificationTitleMarathi, DisplayStartDateTime, DisplayEndDateTime, PublishDateTime, ContentType, TextContent, TextContentMarathi, FileContentName, FileContentURL, OpenInNewPage, DisplayNewImage, IsActive, IsDeleted, RegionID, dbo.fnGetISTDateTime(), @UserLoginID, @IPAddress FROM Administration_NotificationDetails (NOLOCK) WHERE NotificationID = @NotificationID

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

	SELECT  @IsDone AS IsOk
