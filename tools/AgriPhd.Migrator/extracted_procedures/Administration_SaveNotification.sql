
CREATE   PROCEDURE [dbo].[Administration_SaveNotification]
	@NotificationID INT,
	@NotificationCategoryID INT,
	@NotificationTitle VARCHAR(1000),
	@NotificationTitleMarathi NVARCHAR(1000),
	@DisplayStartDateTime DATETIME,
	@DisplayEndDateTime DATETIME,
	@PublishDateTime DATETIME,
	@ContentType CHAR(1),
	@TextContent NVARCHAR(MAX),
	@TextContentMarathi NVARCHAR(MAX),
	@FileContentName VARCHAR(100),
	@FileContentURL VARCHAR(500),
	@OpenInNewPage SMALLINT,
	@DisplayNewImage SMALLINT,
	@IsActive SMALLINT,
	@RegionID SMALLINT,
	@UserLoginID VARCHAR(50),
	@IPAddress VARCHAR(50)
AS
	DECLARE @Notification TABLE (NotificationID INT)
	DECLARE @IsDone VARCHAR(500) = 'N'

	BEGIN TRY
		BEGIN TRAN

		IF (@NotificationID > 0)
			BEGIN
				UPDATE Administration_NotificationDetails
				SET NotificationCategoryID = @NotificationCategoryID, NotificationTitle = @NotificationTitle, NotificationTitleMarathi = @NotificationTitleMarathi, DisplayStartDateTime = @DisplayStartDateTime, DisplayEndDateTime = @DisplayEndDateTime, PublishDateTime = @PublishDateTime, ContentType = @ContentType, TextContent = @TextContent, TextContentMarathi = @TextContentMarathi, FileContentName = CASE WHEN LEN(@FileContentName) > 0 THEN @FileContentName ELSE FileContentName END, FileContentURL = CASE WHEN LEN(@FileContentURL) > 0 THEN @FileContentURL ELSE FileContentURL END, OpenInNewPage = @OpenInNewPage, DisplayNewImage = @DisplayNewImage, IsActive = @IsActive, ModifiedDateTime = dbo.fnGetISTDateTime(), ModifiedBy = @UserLoginID, ModifiedByIPAddress = @IPAddress
				WHERE NotificationID = @NotificationID
			END
		ELSE
			BEGIN
				INSERT INTO Administration_NotificationDetails (NotificationCategoryID, NotificationTitle, NotificationTitleMarathi, DisplayStartDateTime, DisplayEndDateTime, PublishDateTime, ContentType, TextContent, TextContentMarathi, FileContentName, FileContentURL, OpenInNewPage, DisplayNewImage, IsActive, IsDeleted, RegionID, ModifiedDateTime, ModifiedBy, ModifiedByIPAddress)
				OUTPUT inserted.NotificationID INTO @Notification
				VALUES (@NotificationCategoryID, @NotificationTitle, @NotificationTitleMarathi, @DisplayStartDateTime, @DisplayEndDateTime, @PublishDateTime, @ContentType, @TextContent, @TextContentMarathi, @FileContentName, @FileContentURL, @OpenInNewPage, @DisplayNewImage, @IsActive, 0, @RegionID, dbo.fnGetISTDateTime(), @UserLoginID, @IPAddress)

				SET @NotificationID = (SELECT NotificationID FROM @Notification)
			END

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
