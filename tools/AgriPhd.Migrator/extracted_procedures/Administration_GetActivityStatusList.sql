
CREATE PROCEDURE [dbo].[Administration_GetActivityStatusList]
	@RegionID SMALLINT
AS
	SELECT 
		ActivityName, ActivityDetails, ActivityStartDateTime, ActivityEndDateTime,
		CONVERT(VARCHAR(23), ActivityStartDateTime, 105) + ' ' + CONVERT(VARCHAR(5),ActivityStartDateTime,108) AS ActivityStartDateTimeF,
		CONVERT(VARCHAR(23), ActivityEndDateTime, 105) + ' ' + CONVERT(VARCHAR(5),ActivityEndDateTime,108) AS ActivityEndDateTimeF
	FROM 
		Master_ActivityStatus (NOLOCK)
	WHERE 
		IsActive = 1 AND RegionID = @RegionID
	ORDER BY
		SeqNo
