CREATE PROCEDURE [dbo].[Base_GetMasterCollege]  
@FacultyID SMALLINT
AS  
  BEGIN
  SELECT   
   CollegeID,CollegeName,CollegeCode   
  FROM Master_College  (NOLOCK)   
  WHERE   
   IsActive = 'Y' AND Master_College.FacultyID  = @FacultyID
  ORDER BY   
  CollegeName
  END

