
CREATE   PROCEDURE [dbo].[Administration_GetNotificationDetails]
	@NotificationID BIGINT
AS
	SELECT        
		A.NotificationID, A.NotificationCategoryID, B.NotificationCategory, A.NotificationTitle, A.NotificationTitleMarathi, 
		DisplayStartDateTime, DisplayEndDateTime, PublishDateTime, ContentType, TextContent, TextContentMarathi, 
		FileContentName, FileContentURL, OpenInNewPage, DisplayNewImage, A.IsActive,
		CONVERT(VARCHAR(23), DisplayStartDateTime, 105) + ' ' + CONVERT(VARCHAR(5),DisplayStartDateTime,108) AS DisplayStartDateTimeF,
		CONVERT(VARCHAR(23), DisplayEndDateTime, 105) + ' ' + CONVERT(VARCHAR(5),DisplayEndDateTime,108) AS DisplayEndDateTimeF,
		CONVERT(VARCHAR(23), PublishDateTime, 105) + ' ' + CONVERT(VARCHAR(5),PublishDateTime,108) AS PublishDateTimeF
	FROM            
		Administration_NotificationDetails (NOLOCK) AS A
		INNER JOIN Master_NotificationCategory (NOLOCK) AS B ON A.NotificationCategoryID = B.NotificationCategoryID
	WHERE
		A.NotificationID = @NotificationID
