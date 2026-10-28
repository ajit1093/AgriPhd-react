CREATE PROCEDURE [dbo].[Base_IsApplicationFormLocked]
	@CandidateID BIGINT
AS
	IF EXISTS (SELECT 1 FROM ApplicationForm_ConfirmationDetails (NOLOCK) WHERE CandidateID = @CandidateID AND IsConfirmed = 1)
		BEGIN
			SELECT 1
		END
	ELSE 
		BEGIN
			SELECT 0
		END
