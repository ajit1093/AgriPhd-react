
CREATE   PROCEDURE [dbo].[Administration_GetNotificationListForDisplay]
	@RegionID SMALLINT,
	@Language VARCHAR(50) = ''
AS
	IF (@Language = 'mr')
		BEGIN
			SELECT   
				ROW_NUMBER() OVER(PARTITION BY A.NotificationCategoryID ORDER BY A.NotificationCategoryID, A.PublishDateTime DESC) AS SrNo,     
				A.NotificationID, A.NotificationCategoryID, B.NotificationCategory, A.NotificationTitleMarathi AS NotificationTitle, 
				A.DisplayStartDateTime, A.DisplayEndDateTime, A.PublishDateTime, 
				CASE WHEN A.NotificationCategoryID = 8 THEN 'F' ELSE A.ContentType END AS ContentType, 
				A.TextContentMarathi AS TextContent, A.FileContentName, 
				CASE WHEN A.NotificationCategoryID = 8 THEN A.TextContent ELSE A.FileContentURL END AS FileContentURL, A.OpenInNewPage, 
				CASE WHEN dbo.fnGetISTDateTime() > DATEADD(DAY, 7, A.DisplayStartDateTime) THEN 0 ELSE A.DisplayNewImage END AS DisplayNewImage, A.IsActive
			FROM            
				Administration_NotificationDetails (NOLOCK) AS A
				INNER JOIN Master_NotificationCategory (NOLOCK) AS B ON A.NotificationCategoryID = B.NotificationCategoryID
			WHERE
				A.IsDeleted = 0 AND A.IsActive = 1 AND RegionID = @RegionID AND dbo.fnGetISTDateTime() BETWEEN DisplayStartDateTime AND DisplayEndDateTime
			ORDER BY
				A.PublishDateTime DESC, NotificationID DESC
		END	
	ELSE
		BEGIN
			SELECT   
				ROW_NUMBER() OVER(PARTITION BY A.NotificationCategoryID ORDER BY A.NotificationCategoryID, A.PublishDateTime DESC) AS SrNo,     
				A.NotificationID, A.NotificationCategoryID, B.NotificationCategory, A.NotificationTitle, A.DisplayStartDateTime, A.DisplayEndDateTime, A.PublishDateTime, 
				CASE WHEN A.NotificationCategoryID = 8 THEN 'F' ELSE A.ContentType END AS ContentType, A.TextContent, A.FileContentName, 
				CASE WHEN A.NotificationCategoryID = 8 THEN A.TextContent ELSE A.FileContentURL END AS FileContentURL, A.OpenInNewPage, 
				CASE WHEN dbo.fnGetISTDateTime() > DATEADD(DAY, 7, A.DisplayStartDateTime) THEN 0 ELSE A.DisplayNewImage END AS DisplayNewImage, A.IsActive
			FROM            
				Administration_NotificationDetails (NOLOCK) AS A
				INNER JOIN Master_NotificationCategory (NOLOCK) AS B ON A.NotificationCategoryID = B.NotificationCategoryID
			WHERE
				A.IsDeleted = 0 AND A.IsActive = 1 AND RegionID = @RegionID AND dbo.fnGetISTDateTime() BETWEEN DisplayStartDateTime AND DisplayEndDateTime
			ORDER BY
				A.PublishDateTime DESC, NotificationID DESC
		END
