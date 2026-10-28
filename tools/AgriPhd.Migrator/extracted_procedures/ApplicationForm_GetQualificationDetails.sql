CREATE PROCEDURE [dbo].[ApplicationForm_GetQualificationDetails]          
 @CandidateID BIGINT,          
 @UserLoginID VARCHAR(50),                  
 @PageCode VARCHAR(50)          
AS          
 SELECT           
  CandidateID,        
  /*HighestQualificationID = ISNULL(D.HighestQualificationID, -1),          
  IsEducationalGap    = ISNULL(D.IsEducationalGap, 0),          
  EducationalGapYears  = ISNULL(D.EducationalGapYears, -1),          
  EducationalGapReason  = ISNULL(D.EducationalGapReason, ''),           
  EligibilityQualificationID = C.QualificationID,          
  EligibilityQualification  = C.Qualification,          
  SeatNo        = ISNULL(D.SeatNo, ''),          
  NoOfAttempts     = ISNULL(D.NoOfAttempts, -1),          
  PassingDistrictID    = ISNULL(D.PassingDistrictID, -1),          
  PassingYear      = ISNULL(D.PassingYear, -1),           
  BoardID       = ISNULL(D.BoardID, -1),          
  MarksObtained    = ISNULL(D.MarksObtained, 0),          
  MarksOutOf     = ISNULL(D.MarksOutOf, 0),          
  Percentage      = ISNULL(D.Percentage, 0)  */        
 ISNULL(CollegeName,'') AS CollegeName,        
 ISNULL(CollegeCity,'') AS CollegeCity,        
 DegreeID,        
 CollegeStateID,        
 CollegeDistrictID,        
 CollegeTalukaID,        
 CollegeTaluka,        
 CollegePinCode,        
 NoOfYearsToComplete,        
 AreYouEmployed,        
 CGPAScore,      
 FacultyID,  
 SubjectID  
 --ISNULL(UGCategoryofAdmission,'') AS UGCategoryofAdmission,        
 --ISNULL(UGSubCategoryofAdmission,'') AS UGSubCategoryofAdmission        
 FROM          
 ApplicationForm_QualificationDetails      
WHERE CandidateID = @CandidateID     
        
 /* ApplicationForm_RegistrationDetails (NOLOCK) A          
  --INNER JOIN Master_Course (NOLOCK) B ON A.AppliedCourseID = B.CourseID            
  --INNER JOIN Master_Qualification (NOLOCK) C ON B.QualificationID = C.QualificationID          
  INNER JOIN Master_Qualification (NOLOCK) C ON  C.QualificationID = 5          
  LEFT JOIN ApplicationForm_QualificationDetails (NOLOCK) D ON A.CandidateID = D.CandidateID          
 WHERE          
  A.CandidateID = @CandidateID  */ 
