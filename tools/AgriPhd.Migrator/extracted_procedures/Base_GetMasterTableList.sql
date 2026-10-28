

CREATE PROCEDURE [dbo].[Base_GetMasterTableList] 
	@TableName			VARCHAR(250),
	@DataValueField		VARCHAR(250),
	@DataTextField		VARCHAR(250),
	@OrderByFields		VARCHAR(500) = '',
	@ParentField		VARCHAR(200) = '',
	@ParentFieldValue	VARCHAR(200) = ''
AS
	DECLARE @SQLQuery NVARCHAR(MAX) = ''

	IF (@ParentField != '' AND @ParentFieldValue != '')
		BEGIN
			SET @SQLQuery = N' SELECT [' + LTRIM(RTRIM(@DataValueField)) + '] AS DataValueField, [' +  LTRIM(RTRIM(@DataTextField)) + '] AS DataTextField, [Group] = ''''
			FROM [' +  LTRIM(RTRIM(@TableName)) + ']'
			+ ' WHERE IsActive = 1  AND [' + LTRIM(RTRIM(@ParentField)) + '] = ''' + LTRIM(RTRIM(@ParentFieldValue)) + ''''
		END
	ELSE
		BEGIN
			SET @SQLQuery = N' SELECT [' +  LTRIM(RTRIM(@DataValueField)) + '] AS DataValueField, [' +  LTRIM(RTRIM(@DataTextField)) + '] AS DataTextField, [Group] = ''''
			FROM [' +  LTRIM(RTRIM(@TableName)) + ']'
			+ ' WHERE IsActive = 1'
		END 

	IF (LTRIM(RTRIM(@OrderByFields)) !='')
		BEGIN
			SET @SQLQuery = @SQLQuery  + ' ORDER BY ' + LTRIM(RTRIM(@OrderByFields))
		END 
	ELSE
		BEGIN
			SET @SQLQuery = @SQLQuery  + ' ORDER BY [' +  LTRIM(RTRIM(@DataTextField)) + ']'
		END 

	EXEC(@SQLQuery)
