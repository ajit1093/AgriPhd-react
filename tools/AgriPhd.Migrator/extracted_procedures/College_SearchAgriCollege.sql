CREATE PROCEDURE [dbo].[College_SearchAgriCollege]      
    @FacultyID SMALLINT,      
    @CollegeUniversityID INT,      
    @CollegeStatusID SMALLINT      
AS      
BEGIN    
 DECLARE @CollegeStatusCode NVARCHAR(50)  
 SET @CollegeStatusCode=CASE @CollegeStatusID WHEN 1 THEN 'AD' WHEN 2 THEN 'GO'  ELSE '' END  
  
    DECLARE @SQLQuery NVARCHAR(MAX) = ''      
      
    SET @SQLQuery = @SQLQuery + '      
        SELECT       
            CollegeCode,     
            District,     
            CollegeName,     
			CollegeAddress,    
            PhdFacultyName,    
            SubjectName,    
            CollegeStatus    
        FROM       
            viewAgriCollegeInformation WITH (NOLOCK)      
        WHERE      
            1 = 1 '      
       
    IF (@FacultyID > 0)      
    BEGIN      
        SET @SQLQuery = @SQLQuery + ' AND FacultyID = ' + CAST(@FacultyID AS VARCHAR)      
    END      
      
    IF (@CollegeUniversityID > 0)      
    BEGIN      
        SET @SQLQuery = @SQLQuery + ' AND CollegeUniversityID = ' + CAST(@CollegeUniversityID AS VARCHAR)      
    END      
      
    IF (@CollegeStatusID!='')      
    BEGIN      
        SET @SQLQuery = @SQLQuery + ' AND CollegeType = ' + '''' +  CAST(@CollegeStatusCode AS VARCHAR)  + ''''    
    END      
      
    SET @SQLQuery = @SQLQuery + ' ORDER BY CollegeCode'      
      
    EXEC(@SQLQuery)      
END    

