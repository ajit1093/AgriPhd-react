CREATE   PROCEDURE [dbo].[Menu_GetMenu]
	@RegionID SMALLINT,
	@UserTypeID INT,
	@UserLoginID VARCHAR(50),
	@Language VARCHAR(50) = ''
AS
	DECLARE @UserID BIGINT = 0
	DECLARE @IsApplicationFormLocked INT = 0
	DECLARE @MenuTbl TABLE (LinkID INT, LinkName NVARCHAR(250), LinkDescription NVARCHAR(500), LinkURL VARCHAR(150), MenuID INT, ParentMenuID INT, CSSClass VARCHAR(150), GroupName VARCHAR(100), Target VARCHAR(50), SeqNo INT, IsNew BIT)

	INSERT INTO @MenuTbl 
	SELECT
		B.LinkID, CASE @Language WHEN 'mr' THEN B.LinkNameMarathi ELSE B.LinkName END AS LinkName, 
		CASE @Language WHEN 'mr' THEN B.LinkDescriptionMarathi ELSE B.LinkDescription END AS LinkDescription, B.LinkURL, 
		A.MenuID, A.ParentMenuID, A.CSSClass, A.GroupName, A.Target, A.SeqNo, A.IsNew
	FROM
		Menu_MasterMenus (NOLOCK) A
		INNER JOIN Menu_MasterLinks (NOLOCK) B ON A.LinkID = B.LinkID
	WHERE
		A.RegionID = @RegionID AND A.UserTypeID = @UserTypeID AND A.IsActive = 1 AND B.IsActive = 1 
		AND dbo.fnGetISTDateTime() BETWEEN DisplayStartDateTime AND DisplayEndDateTime
	ORDER BY
		A.ParentMenuID, SeqNo

	IF (@UserTypeID = 91)
		BEGIN
			SELECT @UserID = UserID FROM Master_User (NOLOCK) WHERE UserLoginID = @UserLoginID
			SELECT @IsApplicationFormLocked = 1 FROM ApplicationForm_ConfirmationDetails (NOLOCK) WHERE CandidateID = @UserID AND IsConfirmed = 1
			
			IF (@IsApplicationFormLocked = 1)
				BEGIN
					DELETE FROM @MenuTbl WHERE GroupName IN ('ApplicationFormBeforeLock')
				END
			ELSE
				BEGIN
					DELETE FROM @MenuTbl WHERE GroupName IN ('ApplicationFormAfterLock')
				END
		END
	
	SELECT * FROM @MenuTbl

