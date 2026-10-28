CREATE   PROCEDURE [dbo].[Base_SearchCandidate]
	@SearchCandidateBy VARCHAR(50),
	@SearchQuery NVARCHAR(MAX)
AS
	DECLARE @SQLQuery NVARCHAR(MAX) = ''

	SET @SQLQuery = @SQLQuery +
	'SELECT 
		A.ApplicationID, A.CandidateName, B.Gender, DOB	= FORMAT(A.DOB,''dd MMM, yyyy''), A.MobileNo, A.EMailID
	FROM
		ApplicationForm_RegistrationDetails (NOLOCK) A
		INNER JOIN Master_Gender (NOLOCK) B ON A.GenderCode = B.GenderCode
	WHERE ' +
		@SearchQuery + ' 
	ORDER BY
		A.CandidateName'

	EXEC(@SQLQuery)

