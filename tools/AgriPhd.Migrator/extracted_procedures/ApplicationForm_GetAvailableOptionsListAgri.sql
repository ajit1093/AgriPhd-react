

CREATE           PROCEDURE [dbo].[ApplicationForm_GetAvailableOptionsListAgri]    
--[ApplicationForm_GetAvailableOptionsListAgri]   100178 
 @CandidateID BIGINT        
AS    

DECLARE		
	@CandidateUGFacultyID SMALLINT,
	@SubjectID			SMALLINT,
	@PHDFacultyID		SMALLINT
	
BEGIN
	SELECT @CandidateUGFacultyID=FacultyID, @SubjectID = SubjectID FROM ApplicationForm_QualificationDetails WHERE CandidateID=@CandidateID
	SELECT @PHDFacultyID = PHDFacultyID FROM Master_PGPHDSubjectMapping WHERE PGFacultyID = @CandidateUGFacultyID AND PGSubjectID = @SubjectID 
 /*      
 DECLARE @AppliedCourseID SMALLINT        
 SELECT @AppliedCourseID = AppliedCourseID FROM ApplicationForm_RegistrationDetails (NOLOCK) WHERE CandidateID = @CandidateID        
        
 SELECT        
 CollegeID, CollegeCode, CollegeName, District, Course, CourseStatus        
 FROM        
  viewCollegeInformation (NOLOCK)        
 WHERE        
  CourseID = @AppliedCourseID        
  AND CollegeID NOT IN (SELECT CollegeID FROM ApplicationForm_AppliedCollegeDetails (NOLOCK) WHERE CandidateID = @CandidateID)  */        
  --EXEC ApplicationForm_GetFacultyWiseScore @CandidateID,'241001336','127.0.01','Weightage'    
    
  SELECT  CollegeID,CollegeCode,CollegeName,      
    District,CollegeStatus,FacultyName,      
    SubjectName,FacultyID,SubjectID      
  FROM viewAgriCollegeInformation VW (NOLOCK) 
  WHERE VW.FacultyID = @PHDFacultyID --@CandidateUGFacultyID --AND VW.SubjectID = @SubjectID
  AND VW.SubjectID IN (SELECT PHDSubjectID FROM Master_PGPHDSubjectMapping WHERE PGSubjectID = @SubjectID)
  AND FacultyID IN (SELECT FacultyID FROM ApplicationForm_FacultyWiseEligibility WHERE CandidateID=@CandidateID AND IsEligible=1)
  
  --JOIN ApplicationForm_RegistrationDetails (NOLOCK)        
  --ON ApplicationForm_RegistrationDetails.CandidateID=@CandidateID  WHERE       
  --FacultyID IN (SELECT FacultyID FROM Master_CandidateResult (NOLOCK) WHERE ApplicationFormNo=ApplicationForm_RegistrationDetails.ApplicationID)      
  --AND CollegeID NOT IN (SELECT CollegeID FROM ApplicationForm_AppliedCollegeDetails (NOLOCK) WHERE CandidateID = @CandidateID)       
  --AND FacultyID IN (SELECT FacultyID FROM ApplicationForm_FacultyWiseEligibility WHERE CandidateID=@CandidateID AND IsEligible=1)  
  --AND (SubjectID IN (SELECT SubjectID FROM Master_EligibleFaculty WHERE EligibleUGFacultyID=@CandidateUGFacultyID AND SubjectID!=0) 
  --OR FacultyID IN  (SELECT FacultyID FROM Master_EligibleFaculty WHERE EligibleUGFacultyID=@CandidateUGFacultyID AND SubjectID=0))




 -- union
 -- SELECT  CollegeID,CollegeCode,CollegeName,      
 --   District,CollegeStatus,FacultyName,      
 --   SubjectName,FacultyID,SubjectID      
 -- FROM viewAgriCollegeInformation (NOLOCK) JOIN ApplicationForm_RegistrationDetails (NOLOCK)        
 -- ON ApplicationForm_RegistrationDetails.CandidateID=100178  WHERE       
 -- EXISTS (SELECT 1 FROM Master_CandidateResult (NOLOCK) WHERE ApplicationFormNo=ApplicationForm_RegistrationDetails.ApplicationID AND FacultyID IN (20,22,23,25,27,28) )      
 -- AND CollegeID NOT IN (SELECT CollegeID FROM ApplicationForm_AppliedCollegeDetails (NOLOCK) WHERE CandidateID = @CandidateID) 
 -- AND (FacultyID = 29 AND EXISTS (SELECT 1 FROM ApplicationForm_FacultyWiseEligibility WHERE CandidateID=@CandidateID AND IsEligible=1 
	--		AND FacultyID IN (20,22,23,25,27,28)))
 --  AND (SubjectID IN (SELECT SubjectID FROM Master_EligibleFaculty WHERE EligibleUGFacultyID=@CandidateUGFacultyID AND SubjectID!=0)) 
 ---- OR FacultyID IN  (SELECT FacultyID FROM Master_EligibleFaculty WHERE EligibleUGFacultyID=@CandidateUGFacultyID AND SubjectID=0))


 END

