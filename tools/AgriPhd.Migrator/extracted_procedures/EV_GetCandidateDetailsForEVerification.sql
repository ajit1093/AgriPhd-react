CREATE     PROCEDURE [dbo].[EV_GetCandidateDetailsForEVerification]
	@CandidateID BIGINT
AS
	SELECT 
		CandidateID			= A.CandidateID,
		ApplicationID		= A.ApplicationID,
		CandidateName	= A.CandidateName,
		Category				= C.CategoryCode,
		AssignedTo			= ISNULL(F.EVCCode, '--'),
		ApplicationFormNo = A.ApplicationFormNo
	FROM 
		ApplicationForm_RegistrationDetails (NOLOCK) A
		INNER JOIN ApplicationForm_CategoryAndOtherReservationDetails (NOLOCK) B ON A.CandidateID = B.CandidateID
		INNER JOIN Master_Category (NOLOCK) C ON B.FinalCategoryID = C.CategoryID
		INNER JOIN ApplicationForm_Status (NOLOCK) D ON A.CandidateID = D.CandidateID
		LEFT JOIN ApplicationForm_EVCDetails (NOLOCK) E ON A.CandidateID = E.CandidateID
		LEFT JOIN Master_EVC (NOLOCK) F ON E.EVCID = F.EVCID
	WHERE
		A.CandidateID = @CandidateID AND D.FormStatus = 'A' 

