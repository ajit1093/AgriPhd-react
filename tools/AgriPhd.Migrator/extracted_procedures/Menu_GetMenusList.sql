CREATE PROCEDURE [dbo].[Menu_GetMenusList]
	@RegionID SMALLINT,
	@UserTypeID INT,
	@ParentMenuID INT
AS
	SELECT 
		B.MenuID, B.UserTypeID, B.ParentMenuID, B.LinkID, A.Directory + ' - ' + A.LinkName AS LinkName, 
		B.DisplayStartDateTime, B.DisplayEndDateTime, B.CSSClass, B.GroupName, B.[Target], B.SeqNo, B.IsNew, B.IsActive
	FROM
		Menu_MasterLinks (NOLOCK) A
		INNER JOIN Menu_MasterMenus (NOLOCK) B ON A.LinkID = B.LinkID
	WHERE
		B.RegionID = @RegionID AND B.UserTypeID = @UserTypeID AND B.ParentMenuID = @ParentMenuID AND A.IsActive = 1
	ORDER BY
		B.SeqNo
