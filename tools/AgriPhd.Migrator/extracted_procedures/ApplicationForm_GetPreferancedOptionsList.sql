CREATE   PROCEDURE [dbo].[ApplicationForm_GetPreferancedOptionsList]
	@CandidateID BIGINT
AS
	SELECT
		A.PreferenceNo, B.CollegeID, B.CollegeCode, B.CollegeName, B.District, B.Course, B.CourseStatus
	FROM
		ApplicationForm_AppliedCollegeDetails (NOLOCK) A
		INNER JOIN viewCollegeInformation (NOLOCK) B ON A.CollegeID = B.CollegeID
	WHERE
		A.CandidateID = @CandidateID AND A.PreferenceNo > 0
	ORDER BY
		A.PreferenceNo

