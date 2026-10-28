
CREATE   PROCEDURE [dbo].[Administration_GetNotificationList] 
	@RegionID SMALLINT
AS
	SELECT        
		A.NotificationID, A.NotificationCategoryID, B.NotificationCategory, A.NotificationTitle, A.NotificationTitleMarathi, 
		DisplayStartDateTime, DisplayEndDateTime, CONVERT(VARCHAR, PublishDateTime, 103) AS PublishDateTime, ContentType, 
		TextContent, TextContentMarathi, FileContentName, FileContentURL, OpenInNewPage, DisplayNewImage, A.IsActive,
		CONVERT(VARCHAR(23), PublishDateTime, 105) + ' ' + CONVERT(VARCHAR(5),PublishDateTime,108) AS PublishDateTimeF
	FROM            
		Administration_NotificationDetails (NOLOCK) AS A
		INNER JOIN Master_NotificationCategory (NOLOCK) AS B ON A.NotificationCategoryID = B.NotificationCategoryID
	WHERE
		A.IsDeleted = 0 AND RegionID = @RegionID
	ORDER BY
		CONVERT(DateTime, PublishDateTime) DESC
