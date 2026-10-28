
CREATE   PROCEDURE [dbo].[Menu_SaveMenusActiveStatus]
	@MenusXML XML
AS
	DECLARE @IsDone VARCHAR(500) = 'N'

	BEGIN TRY
		BEGIN TRAN

		UPDATE 
			Menu_MasterMenus
		SET
			SeqNo				= Item.value('(SeqNo/text())[1]', 'INT'),
			IsActive			= Item.value('(IsActive/text())[1]', 'BIT'),
			ModifiedDateTime	= dbo.fnGetISTDateTime(),
			ModifiedBy			= Item.value('(UserLoginID/text())[1]', 'VARCHAR(50)'),
			ModifiedByIPAddress = Item.value('(IPAddress/text())[1]', 'VARCHAR(50)')
		FROM 
			@MenusXML.nodes('/ArrayOfMenuEntity/MenuEntity') AS Tbl(Item)
		WHERE 
			MenuID = Item.value('(MenuID/text())[1]', 'INT')

		INSERT INTO Menu_MasterMenus_History (MenuID, UserTypeID, ParentMenuID, LinkID, DisplayStartDateTime, DisplayEndDateTime, CSSClass, GroupName, Target, SeqNo, IsNew, IsActive, RegionID, ModifiedDateTime, ModifiedBy, ModifiedByIPAddress)
		SELECT MenuID, UserTypeID, ParentMenuID, LinkID, DisplayStartDateTime, DisplayEndDateTime, CSSClass, GroupName, Target, SeqNo, IsNew, IsActive, RegionID, ModifiedDateTime, ModifiedBy, ModifiedByIPAddress
		FROM Menu_MasterMenus (NOLOCK)
		WHERE MenuID IN (SELECT Item.value('(MenuID/text())[1]', 'BIT') FROM @MenusXML.nodes('/ArrayOfMenuEntity/MenuEntity') AS Tbl(Item))

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
