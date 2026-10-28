  
            
CREATE PROCEDURE [dbo].[Admission_GetAllotmentSummary]            
 @CandidateID BIGINT            
AS            
 SELECT ApplicationID, CandidateName,ApplicationFormNo FROM ApplicationForm_RegistrationDetails (NOLOCK) WHERE CandidateID = @CandidateID            
            
 SELECT             
  PhaseID   = A.PhaseID,            
  Phase   = A.Phase,             
  ChoiceCode  = ISNULL(CAST(B.ChoiceCode AS VARCHAR), '--'),              
  CollegeName  = ISNULL(C.CollegeName, '--'),             
  /*Course   = ISNULL(C.Course, '--'),             
  CourseStatus = ISNULL(C.CourseStatus, '--'),*/            
  C.FacultyName     AS FacultyName,            
  C.SubjectName     AS SubjectName,            
  CurrentStatus = CASE B.ReportingStatus            
       WHEN 'Y' THEN 'Admitted'                    
       WHEN 'R' THEN 'Admission Rejected'             
       WHEN 'C' THEN 'Admission Cancelled'             
       WHEN 'Z' THEN 'Candidate Refused Admission'             
       WHEN 'N' THEN CASE B.SeatAcceptanceStatus WHEN 'Y' THEN 'Allotment Letter Downloaded' ELSE 'Allotment Letter Not Downloaded' END             
       ELSE 'Not Allotted'            
      END            
 FROM             
  Master_Phase (NOLOCK) A            
  LEFT OUTER JOIN College_AllotmentDetails (NOLOCK) B ON A.PhaseID = B.PhaseID AND B.CandidateID = @CandidateID            
  LEFT OUTER JOIN ViewAgriCollegeInformation (NOLOCK) C ON B.PHDCollegeCode = C.CollegeCode            
            
 WHERE             
  A.IsActive = 1 AND A.AllotmentDisplayStartDate IS NOT NULL AND A.AllotmentDisplayStartDate < dbo.fnGetISTDateTime() /*AND A.PhaseID = 1*/            

