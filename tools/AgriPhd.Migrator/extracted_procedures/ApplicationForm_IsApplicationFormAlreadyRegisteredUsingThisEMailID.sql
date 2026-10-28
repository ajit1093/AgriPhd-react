
CREATE PROCEDURE [dbo].[ApplicationForm_IsApplicationFormAlreadyRegisteredUsingThisEMailID]
	@CandidateID BIGINT,
	@EMailID VARCHAR(100)
AS
	DECLARE @TotalRegisteredUsingThisEMailID INT = 0
	SELECT @TotalRegisteredUsingThisEMailID = COUNT(*) FROM ApplicationForm_RegistrationDetails (NOLOCK) WHERE EMailID = @EMailID AND CandidateID <> @CandidateID
	
	IF (@TotalRegisteredUsingThisEMailID >= 1)
		BEGIN
			SELECT 1
		END
	ELSE
		BEGIN
			SELECT 0
		END
