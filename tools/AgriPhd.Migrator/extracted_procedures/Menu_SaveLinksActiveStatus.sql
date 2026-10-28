
CREATE   PROCEDURE [dbo].[Menu_SaveLinksActiveStatus]
	@LinksXML XML
AS
	DECLARE @IsDone VARCHAR(500) = 'N'

	BEGIN TRY
		BEGIN TRAN

		UPDATE 
			Menu_MasterLinks
		SET
			IsActive			= Item.value('(IsActive/text())[1]', 'BIT'),
			ModifiedDateTime	= dbo.fnGetISTDateTime(),
			ModifiedBy			= Item.value('(UserLoginID/text())[1]', 'VARCHAR(50)'),
			ModifiedByIPAddress = Item.value('(IPAddress/text())[1]', 'VARCHAR(50)')
		FROM 
			@LinksXML.nodes('/ArrayOfLinkEntity/LinkEntity') AS Tbl(Item)
		WHERE 
			LinkID = Item.value('(LinkID/text())[1]', 'INT')

		INSERT INTO Menu_MasterLinks_History (LinkID, LinkName, LinkDescription, LinkURL, LinkType, Directory, PageName, QueryString, IsActive, ModifiedDateTime, ModifiedBy, ModifiedByIPAddress)
		SELECT LinkID, LinkName, LinkDescription, LinkURL, LinkType, Directory, PageName, QueryString, IsActive, ModifiedDateTime, ModifiedBy, ModifiedByIPAddress
		FROM Menu_MasterLinks (NOLOCK)
		WHERE LinkID IN (SELECT Item.value('(LinkID/text())[1]', 'BIT') FROM @LinksXML.nodes('/ArrayOfLinkEntity/LinkEntity') AS Tbl(Item))

		COMMIT TRAN
		SET @IsDone = 'Y'
	END TRY
	BEGIN CATCH
		IF(@@TRANCOUNT > 0)
			ROLLBACK TRAN
			
		SET @IsDone = 'N'
		 
		INSERT INTO Log_ErrorDetails(LogSource, ErrorMessage, LogDate, UserLoginID)
		VALUES(ERROR_PROCEDURE(), ERROR_MESSAGE(), dbo.fnGetISTDateTime(), '') 
	END CATCH
 
	SELECT @IsDone AS IsOk
