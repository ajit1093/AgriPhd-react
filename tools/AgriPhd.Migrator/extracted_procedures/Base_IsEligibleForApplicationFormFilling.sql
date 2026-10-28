
CREATE PROCEDURE [dbo].[Base_IsEligibleForApplicationFormFilling]
	@CandidateID BIGINT,
	@UserLoginID VARCHAR(50)
AS
	IF EXISTS (SELECT 1 FROM ApplicationForm_ConfirmationDetails (NOLOCK) WHERE CandidateID = @CandidateID AND IsConfirmed = 1)
		BEGIN
			SELECT CAST(0 AS BIT)
		END
	ELSE
		BEGIN
			SELECT IsEligible FROM dbo.fnCheckApplicationFormFillingEligiblity(@CandidateID, @UserLoginID)
		END
