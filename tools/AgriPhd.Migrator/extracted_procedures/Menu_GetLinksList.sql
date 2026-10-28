


CREATE PROCEDURE [dbo].[Menu_GetLinksList]
	@Directory VARCHAR(50)
AS
	SELECT 
		LinkID, LinkName, LinkDescription, LinkURL, LinkType, Directory, PageName, QueryString, IsActive
	FROM            
		Menu_MasterLinks (NOLOCK)
	WHERE
		Directory = @Directory
	ORDER BY
		LinkName
