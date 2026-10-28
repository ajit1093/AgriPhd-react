CREATE PROCEDURE [dbo].[Admission_GetAllotedStudentList]                
    @Faculty        SMALLINT,              
 @SubjectID      SMALLINT,              
    @PhaseID        SMALLINT,                
    @CollegeID      SMALLINT,                
    @ReportStatus   VARCHAR(10)                
AS                
BEGIN                
    SELECT          
  ApplicationID AS CetApplicationFormNo,          
  ApplicationFormNo,          
        CandidateName = ISNULL(Salute.Saluation, '') + ' ' + CandidateName,                
        MobileNo AS MobileNo,                
  MFS.SubjectName AS SubjectName,      
        ISNULL(EMailID, '') AS EmailAddress,                
        ISNULL(AppFormAddr.City, '') AS CandidateCity,                
        /*MstrOrgCategory.CategoryCode AS CandidateCategory,                
        MstrAllotCategory.CategoryCode AS AllottedCategory,*/      
  CandidateCategoryDisplay=ISNULL(StudentCategoryDisplay,''),      
  AllottedCategoryDisplay=ISNULL(AllottedCategoryDisplay,''),       
        ISNULL(AllottedTypeDisplay, '') AS AllottedType,                
        CurrentReportingStatus = CASE Allot.ReportingStatus                
            WHEN 'Y' THEN 'Admitted'        
            WHEN 'R' THEN 'Admission Rejected'                
            WHEN 'C' THEN 'Admission Cancelled'                
            WHEN 'Z' THEN 'Candidate Refused the Admission'        
            WHEN 'N' THEN CASE Allot.SeatAcceptanceStatus WHEN 'Y' THEN 'Allotment Letter Downloaded' ELSE 'Allotment Letter Not Downloaded' END                
            ELSE 'Not Allotted'                 
        END,             
  ISNULL(FE.TotalProvisinalScore,0) AS TotalScore,    
  Master_University.UniversityCode+','+Master_University.UniversityCity AS  CandidateUniversity,    
    CASE Allot.SeatAcceptanceStatus                       
     WHEN 'Y' THEN                       
      CASE Allot.ReportingStatus                      
       WHEN 'Y' THEN 'Admitted'                       
       WHEN 'R' THEN 'Rejected'                      
       WHEN 'C' THEN 'Cancelled'                      
       WHEN 'Z' THEN 'Candidate Refused'         
    WHEN 'N' THEN 'Not Reported'         
       ELSE 'Not Admitted'                      
      END                      
     --ELSE 'Allotment Letter Not Downloaded'                      
  ELSE 'Not Reported'        
    END                      
   --ELSE 'Allotment Letter Download Fee Not Paid'                      
  --END                 
  AS CurrentStatus,    
    
   ReportingComments=CASE Allot.ReportingStatus                      
       WHEN 'Y' THEN    Allot.AdmissionComments         
       WHEN 'R' THEN Allot.AdmissionComments                    
       WHEN 'C' THEN Allot.CancellationComments                     
       WHEN 'Z' THEN Allot.RefusalReason  END      
        /*AllotmentLetterDownloaded =          
  CASE Allot.ReportingStatus WHEN 'Z' THEN  'Candidate Refused The Admission'         
  ELSE         
  CASE Allot.SeatAcceptanceStatus        
            WHEN 'Y'             
   THEN 'Allotment Letter Downloaded'                 
            ELSE 'Allotment Letter Not Downloaded'                 
        END  END          */    
    FROM College_AllotmentDetails Allot    (NOLOCK)            
    JOIN ApplicationForm_RegistrationDetails Reg     (NOLOCK)            
        ON Allot.CandidateID = Reg.CandidateID                 
        AND Allot.PhaseID = @PhaseID                        
     AND Allot.ReportingStatus = CASE WHEN @ReportStatus='A' THEN Allot.ReportingStatus ELSE @ReportStatus END                
    JOIN Master_Saluation Salute   (NOLOCK)              
        ON Reg.SaluationID = Salute.SaluationID                
    JOIN ApplicationForm_CategoryAndOtherReservationDetails OrgCategoryTbl   (NOLOCK)              
        ON OrgCategoryTbl.CandidateID = Reg.CandidateID                  
    JOIN ApplicationForm_AddressDetails AppFormAddr    (NOLOCK)            
        ON AppFormAddr.CandidateID = Reg.CandidateID                
 JOIN Master_PHDCollegeCode MSTRPG (NOLOCK)ON MSTRPG.PHDCollegeCode=Allot.PHDCollegeCode                 
 JOIN Master_College MstrCollegeCode (NOLOCK) ON  MstrCollegeCode.CollegeCode=MSTRPG.CollegeCode AND MstrCollegeCode.CollegeID=@CollegeID              
 AND MstrCollegeCode.FacultyID = @Faculty                 
 JOIN Master_FacultyWiseSubjects MFS (NOLOCK)ON MFS.SubjectID=MSTRPG.SubjectID AND MFS.FacultyID=MSTRPG.FacultyID                 
 AND MSTRPG.SubjectID= CASE WHEN @SubjectID=0 THEN MSTRPG.SubjectID ELSE @SubjectID END                  
 INNER JOIN Master_College ON Master_College.CollegeCode=Allot.ChoiceCode        
 JOIN ApplicationForm_FacultyWiseEligibility FE ON FE.CandidateID=Allot.CandidateID AND FE.FacultyID=Master_College.FacultyID       
JOIN Master_University ON Master_University.UniversityID=Allot.StudentUniID         
END 

