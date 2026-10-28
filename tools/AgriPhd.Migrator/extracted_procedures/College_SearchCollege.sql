CREATE   PROCEDURE [dbo].[College_SearchCollege]
	@CourseID SMALLINT,
	@DistrictID INT,
	@CourseStatusID SMALLINT
AS
	DECLARE @SQLQuery NVARCHAR(MAX) = ''

	SET @SQLQuery = @SQLQuery + '
					SELECT 
						CollegeCode, District, CollegeName, Course, CourseStatus, Intake
					FROM 
						viewCollegeInformation (NOLOCK)
					WHERE
						1 = 1'
	
	IF (@CourseID > 0)
		BEGIN
			SET @SQLQuery = @SQLQuery + ' AND CourseID = ' + CAST(@CourseID AS VARCHAR)
		END

	IF (@DistrictID > 0)
		BEGIN
			SET @SQLQuery = @SQLQuery + ' AND DistrictID = ' + CAST(@DistrictID AS VARCHAR)
		END

	IF (@CourseStatusID > 0)
		BEGIN
			SET @SQLQuery = @SQLQuery + ' AND CourseStatusID = ' + CAST(@CourseStatusID AS VARCHAR)
		END

	SET @SQLQuery = @SQLQuery + ' ORDER BY CollegeCode'

	EXEC(@SQLQuery)

