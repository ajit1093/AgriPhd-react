CREATE   PROCEDURE [dbo].[ApplicationForm_GetPhotoAndSignDetails]
	@CandidateID BIGINT,       
	@UserLoginID VARCHAR(50),         
	@PageCode VARCHAR(50) = ''
AS
	SELECT	
		CandidateID				= CandidateID,	
		PhotoUploadedURL	= CASE WHEN LEN(PhotoUploadedURL) > 0 THEN '../Public/ViewFile.aspx?FileName=Photograph&FileURL=' + PhotoUploadedURL ELSE PhotoUploadedURL END,
		SignUploadedURL		= CASE WHEN LEN(SignUploadedURL) > 0 THEN '../Public/ViewFile.aspx?FileName=Signature&FileURL=' + SignUploadedURL ELSE SignUploadedURL END
	FROM 
		ApplicationForm_PhotoAndSignDetails (NOLOCK)
	WHERE 
		CandidateID = @CandidateID

