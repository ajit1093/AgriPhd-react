
CREATE   PROCEDURE [dbo].[Administration_GetEVCList] 
	@Flag VARCHAR(50)
AS
	IF (@Flag = 'All')
		BEGIN
			SELECT 
				EVCID, EVCCode, CoordinatorName, CoordinatorMobileNo, CoordinatorEMailID, 
				CASE IsActive WHEN 1 THEN 'Y' ELSE 'N' END AS IsActive
			FROM
				Master_EVC (NOLOCK)
			WHERE
				ParentEVCID = 0
		END
	ELSE 
		BEGIN
			SELECT 
				EVCID, EVCCode, CoordinatorName, CoordinatorMobileNo, CoordinatorEMailID, 
				CASE IsActive WHEN 1 THEN 'Y' ELSE 'N' END AS IsActive
			FROM
				Master_EVC (NOLOCK)
			WHERE
				ParentEVCID = 0 AND IsActive = 1
		END

