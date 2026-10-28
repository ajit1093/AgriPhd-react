
CREATE PROCEDURE [dbo].[ApplicationForm_CheckURL] 
	@CandidateID BIGINT,
	@UserLoginID VARCHAR(50),
	@PageCode VARCHAR(100)
AS
	DECLARE @DashboardURL VARCHAR(100) = ''
	DECLARE @CurrentLinkID INT = 0
	DECLARE @NextLinkID INT = 0
	DECLARE @StepID INT = 0
	DECLARE @IsEligible BIT = 1
	DECLARE @ErrMsg VARCHAR(250) = ''
	DECLARE @IsRightUrl BIT = 0
	DECLARE @RightUrl VARCHAR(250) = ''

	SELECT @DashboardURL = DashboardURL FROM Master_User (NOLOCK) A INNER JOIN Master_UserType (NOLOCK) B ON A.UserTypeID = B.UserTypeID WHERE A.UserLoginID = @UserLoginID
	SELECT @CurrentLinkID = LinkID FROM Master_ApplicationFormLinks (NOLOCK) WHERE PageCode = @PageCode AND LinkType = 'A'
	SELECT @StepID = StepID FROM ApplicationForm_Status (NOLOCK) WHERE CandidateID = @CandidateID
	SELECT @IsEligible = IsEligible, @ErrMsg = ErrMsg FROM dbo.fnCheckApplicationFormFillingEligiblity(@CandidateID, @UserLoginID)
	
	IF (@IsEligible = 1)
		BEGIN
			IF (@CurrentLinkID <= @StepID)
				BEGIN
					SET @IsRightUrl = 1
				END 
			ELSE
				BEGIN
					SELECT TOP 1 @NextLinkID = LinkID FROM Master_ApplicationFormLinks (NOLOCK)  WHERE LinkType = 'A' AND LinkID >= @StepID AND IsActive = 1 ORDER BY LinkID
				END
		END
	ELSE
		BEGIN
			SET @IsRightUrl = 0
			SET @NextLinkID = 0
		END

	IF (@IsRightUrl = 0 AND @NextLinkID > 0)
		BEGIN
			SELECT @RightUrl = ISNULL(LinkURL, '') FROM Master_ApplicationFormLinks (NOLOCK) WHERE LinkID = @NextLinkID AND LinkType = 'A'
		END
	ELSE IF (@IsRightUrl = 0 AND @NextLinkID = 0)
		BEGIN
			SET @RightUrl = @DashboardURL + '?ErrMsg=' + @ErrMsg
		END 

	SELECT IsRightUrl = @IsRightUrl, RightUrl = @RightUrl
