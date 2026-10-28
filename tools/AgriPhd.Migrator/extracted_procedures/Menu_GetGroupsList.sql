CREATE PROCEDURE [dbo].[Menu_GetGroupsList]
	@RegionID SMALLINT,
	@UserTypeID INT
AS
	SELECT 
		B.MenuID, B.UserTypeID, B.ParentMenuID, B.LinkID, A.LinkName, B.DisplayStartDateTime, B.DisplayEndDateTime,
		B.CSSClass, B.GroupName, B.[Target], B.SeqNo, B.IsNew, B.IsActive
	FROM
		Menu_MasterLinks (NOLOCK) A
		INNER JOIN Menu_MasterMenus (NOLOCK) B ON A.LinkID = B.LinkID
	WHERE
		B.RegionID = @RegionID AND B.UserTypeID = @UserTypeID AND B.ParentMenuID = 0
	ORDER BY
		B.SeqNo
