CREATE   PROCEDURE [dbo].[Dashboard_GetCollegeDashboard]      
 @CollegeID BIGINT      
AS    
BEGIN     
 DECLARE @CollegeCode BIGINT    
    
 SELECT @CollegeCode=CollegeCode FROM Master_College WHERE CollegeID=@CollegeID     
    
 SELECT      
  --Intake  = ISNULL((SELECT SUM(Intake) FROM ViewAgriCollegeInformation (NOLOCK) WHERE CollegeID = @CollegeID), 0),      
  Intake  = ISNULL((SELECT SUM(Intake) FROM Master_College (NOLOCK) WHERE CollegeID = @CollegeID), 0),      
  Admitted = (SELECT COUNT(1) FROM College_AllotmentDetails (NOLOCK) WHERE ChoiceCode = @CollegeCode AND ReportingStatus = 'Y'),      
  Vacancy = ISNULL((SELECT SUM(Intake) FROM Master_College (NOLOCK) WHERE CollegeID = @CollegeID), 0) -     
  (SELECT COUNT(1) FROM College_AllotmentDetails (NOLOCK) WHERE ChoiceCode = @CollegeCode AND ReportingStatus = 'Y')      
END  
  

