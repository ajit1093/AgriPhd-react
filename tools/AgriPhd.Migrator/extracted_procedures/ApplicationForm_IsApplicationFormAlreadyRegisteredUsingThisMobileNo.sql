
CREATE PROCEDURE [dbo].[ApplicationForm_IsApplicationFormAlreadyRegisteredUsingThisMobileNo]
	@CandidateID BIGINT,
	@MobileNo VARCHAR(10)
AS
	DECLARE @TotalRegisteredUsingThisMobileNo INT = 0
	SELECT @TotalRegisteredUsingThisMobileNo = COUNT(*) FROM ApplicationForm_RegistrationDetails (NOLOCK) WHERE MobileNo = @MobileNo AND CandidateID <> @CandidateID
	
	IF (@TotalRegisteredUsingThisMobileNo >= 1)
		BEGIN
			SELECT 1
		END
	ELSE
		BEGIN
			SELECT 0
		END
