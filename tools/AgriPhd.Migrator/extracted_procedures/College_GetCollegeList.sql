CREATE    PROCEDURE [dbo].[College_GetCollegeList]        
 @FacultyID SMALLINT,        
 @DistrictID INT,        
 @CollegeCode VARCHAR(11),        
 @CollegeName VARCHAR(250)        
AS        
 DECLARE @SQLQuery NVARCHAR(MAX) = ''        
        
 SET @SQLQuery = @SQLQuery + '        
     SELECT         
      A.CollegeCode, B.District, A.CollegeName, D.FacultyName AS Faculty, C.UserMobileNo, C.UserPassword,        
   CASE A.IsActive WHEN ''Y'' THEN ''Active'' ELSE ''Not Active'' END AS CurrentStatus,NodalOfficerName,
   NodalOfficerEmail,NodalOfficerContactNo,Intake,CollegePhoneNo,CollegeFaxNo,
   CollegeEmail,Master_Taluka.Taluka,CollegeType,CollegeAddress + '''' +  + '','' + ISNULL(City,'''')  + '','' +  ISNULL(PIN,'''')  AS CollegeAddress ,
     dbo.fnGetSubjectNamesByCollegeCode(CollegeCode) AS CollegeSubjects ,Master_University.UniversityName AS University
     FROM         
      Master_College (NOLOCK) A        
      INNER JOIN Master_District (NOLOCK) B ON A.DistrictID = B.DistrictID        
      INNER JOIN Master_User (NOLOCK) C ON A.CollegeID = C.UserID        
   INNER JOIN Master_Faculty D ON D.FacultyID=A.FacultyID 
   JOIN Master_Taluka ON A.TalukaID = Master_Taluka.TalukaID
   JOIN Master_University ON Master_University.UniversityID=A.CollegeUniversityID
      /*INNER JOIN Master_CourseStatus (NOLOCK) E ON A.CourseStatusID = E.CourseStatusID*/      
     WHERE        
      1 = 1'        
         
 IF (@FacultyID > 0)        
  BEGIN        
   SET @SQLQuery = @SQLQuery + ' AND A.FacultyID = ' + CAST(@FacultyID AS VARCHAR)        
  END        
        
 IF (@DistrictID > 0)        
  BEGIN        
   SET @SQLQuery = @SQLQuery + ' AND A.DistrictID = ' + CAST(@DistrictID AS VARCHAR)        
  END        
        
 IF (LEN(@CollegeCode) > 0)        
  BEGIN        
   SET @SQLQuery = @SQLQuery + ' AND CAST(A.CollegeCode AS VARCHAR) = ' + @CollegeCode        
  END        
        
 IF (LEN(@CollegeName) > 0)        
  BEGIN        
   SET @SQLQuery = @SQLQuery + ' AND A.CollegeName LIKE ''%' + @CollegeName + '%'''        
  END        
        
 SET @SQLQuery = @SQLQuery + ' ORDER BY A.CollegeCode'        
        
 EXEC(@SQLQuery) 



