      
CREATE PROCEDURE [dbo].[Admission_GetAllotmentList]                  
 @CollegeID BIGINT,                 
 @PhaseID SMALLINT                 
AS                  
BEGIN                 
 SELECT                  
  CandidateID       = A.CandidateID,                   
  ApplicationID      = A.ApplicationID,                   
  /*AppliedCourse      = A.AppliedCourse,   */                
  CandidateName      = ISNULL(SAL.Saluation,'') + ' ' + A.CandidateName,            
   FatherName        = A.FatherName,                       
  MotherName        = A.MotherPresentName,            
  ApplicationFormNo = A.ApplicationFormNo,            
  MobileNo = A.MobileNo,                
  EMailID = A.EMailID,                
  FacultyName = E.FacultyName,                
  SubjectName = E.SubjectName,            
  Gender        = B.Gender,                   
  DOB         = FORMAT(A.DOB,'dd MMM, yyyy'),                   
  --Category       = F.CategoryCode,                  
  PhotoURL       = P.PhotoUploadedURL,                   
  SignURL        = P.SignUploadedURL,                     
  AcademicWeightage     = Q.CGPAScore,                            
  MeritNo        = C.MeritNo,                   
  AllotmentPhaseID     = D.PhaseID,                   
  AllotmentPhase      = D.Phase,                     
  AllottedCollegeID     = E.CollegeID,                  
  AllottedCollegeCode     = C.ChoiceCode,                  
  AllottedCollege      = E.CollegeName,                   
  AllottedCollegeDistrictID   = E.DistrictID,                   
  AllottedCollegeDistrict    = E.District,                   
  AllotedCollegeAddress = E.CollegeAddress,            
  AllottedPreferenceNo    = C.AllottedPreferenceNo,                   
  AllottedCategory     = G.Category,                    
  --AllottedType      = C.AllottedType,              
   AllottedQuota = C.AllottedQuota,            
   SubjectCode = C.PHDCollegeCode,            
  C.RosterSeqNo AS RoasterSeqNo,      
  C.RoasterPoint as RoasterPoint,      
  ISNULL(C.RoasterCategory,'') as RoasterCategory,       
  ISNULL(C.AllottedGender,'') AS AllotedGender,      
  AllottedTypeDisplay     = C.AllottedTypeDisplay,                  
  AllotmentDate      = FORMAT(C.AllotmentDate,'dddd, MMM dd, yyyy'),                  
  AdmissionSchedule     = CASE WHEN D.AdmissionStartDate IS NOT NULL AND D.CandidateAdmissionLastDate IS NOT NULL THEN FORMAT(D.AdmissionStartDate,'dd MMM, yyyy hh:mm:ss tt') + ' To ' + FORMAT(D.CandidateAdmissionLastDate,'dd MMM, yyyy hh:mm:ss tt') ELSE 
  
    
'' END,                  
  CandidateAdmissionLastDate   = ISNULL(FORMAT(D.CandidateAdmissionLastDate, 'dd MMM, yyyy hh:mm:ss tt'), ''),                  
  IsAllotmentLetterDownloaded   = CASE C.SeatAcceptanceStatus WHEN 'Y' THEN 1 ELSE 0 END,                  
  AllotmentLetterDownloadedOn   = CASE C.SeatAcceptanceStatus WHEN 'Y' THEN ISNULL(FORMAT(C.SeatAcceptedDateTime,'dd MMM, yyyy hh:mm:ss tt'), '--') ELSE '--' END,                  
  IsEligibleToDownloadAllotmentLetter = CASE WHEN D.IsCurrentPhase = 1 AND D.AllotmentDisplayStartDate IS NOT NULL AND D.CandidateAdmissionLastDate IS NOT NULL AND dbo.fnGetISTDateTime() BETWEEN D.AllotmentDisplayStartDate AND D.CandidateAdmissionLastDate
  
    
      
 THEN 1 ELSE 0 END,                  
  IsRefusalFeePaid     = CASE WHEN H.RemainingFee <= 0 THEN 1 ELSE 0 END,                  
  RefusalRemainingFee     = H.RemainingFee ,            
  ApplicationFormNo = A.ApplicationFormNo,           
  IsRefused = C.IsRefused,          
  IsAccepted = C.IsAccepted,          
  IsPWD = CASE WHEN  T.IsPWD = 1 THEN 'YES' ELSE 'NO' END,            
  IsOrphan = CASE WHEN  T.IsOrphan = 1 THEN 'YES' ELSE 'NO' END,              
  AllottedNodalOfficerName =  E.NodalOfficerName,   AllottedNodalOfficerMobileNo=E.NodalOfficerContactNo,   AllottedNodalOfficerEMailID=E.NodalOfficerEmail,      
  CollegeUniversity= U.UniversityName + ',' + ISNULL(U.UniversityCity,''),      
  CandidateHomeUniversity=STUDUniv.UniversityName,      
  GraduationFaculty=GraduationFaculty.FacultyName,      
  C.AllottedCategoryDisplay,      
  C.StudentCategoryDisplay      
 FROM          
  /*VW_CandidateData (NOLOCK) A  */                
  ApplicationForm_RegistrationDetails (NOLOCK) A                 
  INNER JOIN Master_Gender (NOLOCK) B ON A.GenderCode = B.GenderCode                  
  INNER JOIN College_AllotmentDetails (NOLOCK) C ON A.CandidateID = C.CandidateID                  
  INNER JOIN Master_Phase (NOLOCK) D ON C.PhaseID = D.PhaseID                  
  --INNER JOIN ViewAgriCollegeInformation (NOLOCK) E ON C.ChoiceCode = E.CollegeCode                  
  INNER JOIN ViewAgriCollegeInformation (NOLOCK) E ON C.PHDCollegeCode = E.CollegeCode                  
  INNER JOIN ApplicationForm_CategoryAndOtherReservationDetails T ON T.CandidateID=A.CandidateID                
  --INNER JOIN Master_Category (NOLOCK) F ON T.FinalCategoryID = F.CategoryID      
  --INNER JOIN Master_Category (NOLOCK) F ON T.VerifiedCategoryID = F.CategoryID                  
  INNER JOIN Master_Category (NOLOCK) G ON C.AllottedCategoryID = G.CategoryID                  
  INNER JOIN ApplicationForm_PhotoAndSignDetails (NOLOCK) P ON P.CandidateID=A.CandidateID                
  INNER JOIN ApplicationForm_QualificationDetails (NOLOCK) Q ON Q.CandidateID=A.CandidateID                 
  INNER JOIN Master_Saluation (NOLOCK) SAL ON  SAL.SaluationID=A.SaluationID       
  INNER JOIN Master_University (NOLOCK) U ON U.UniversityID=E.CollegeUniversityID       
  INNER JOIN Master_University (NOLOCK) STUDUniv ON C.StudentUniID=STUDUniv.UniversityID      
  INNER JOIN Master_Faculty GraduationFaculty (NOLOCK) ON GraduationFaculty.FacultyID=Q.FacultyID      
  INNER JOIN Master_PHDCollegeCode PG  (NOLOCK) ON PG.PHDCollegeCode = E.CollegeCode       
  INNER JOIN Master_College ON Master_College.CollegeCode=PG.CollegeCode      
  CROSS APPLY dbo.fnCalculateFee(A.CandidateID,@PhaseID) H                  
 WHERE                   
  C.PhaseID = @PhaseID AND Master_College.CollegeID = @CollegeID       
END 

