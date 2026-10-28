
CREATE   PROCEDURE [dbo].[Administration_GetEVCDetails]
	@EVCID BIGINT
AS
	SELECT
		EVCID, ParentEVCID, EVCCode, CoordinatorName, CoordinatorMobileNo, CoordinatorEMailID
	FROM            
		Master_EVC (NOLOCK)
	WHERE
		EVCID = @EVCID

