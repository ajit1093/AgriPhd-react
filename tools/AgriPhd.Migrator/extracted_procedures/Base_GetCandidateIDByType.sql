CREATE   PROCEDURE [dbo].[Base_GetCandidateIDByType]  
	@SearText VARCHAR(21),
	@SearchBy VARCHAR(1)
AS  
BEGIN 
	DECLARE @CandidateID BIGINT = 0  
	
	IF(@SearchBy='L')
	BEGIN
		SELECT @CandidateID = CandidateID FROM ApplicationForm_RegistrationDetails (NOLOCK) WHERE ApplicationID = @SearText  
	END
	ELSE IF (@SearchBy='A')
	BEGIN
		SELECT @CandidateID = CandidateID FROM ApplicationForm_RegistrationDetails (NOLOCK) WHERE ApplicationFormNo = @SearText  
	END
	SELECT @CandidateID  
	
END

