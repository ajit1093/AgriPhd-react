CREATE PROCEDURE [dbo].[Admission_GetAdmissionSummary]                         
@CandidateID BIGINT,                          
@PGCollegeCode BIGINT,                          
@PhaseID SMALLINT,                          
@UserLoginID VARCHAR(50),                         
@ReportingStatus CHAR(1),                         
@Flag VARCHAR(50)                         
AS                           
BEGIN                       
SELECT                         
  CandidateID        = A.CandidateID,                          
  ApplicationID       = A.ApplicationID,                   
  ApplicationFormNo  = A.ApplicationFormNo,              
  /*AppliedCourse       = A.AppliedCourse,   */                       
  CandidateName       = A.CandidateName,                          
  FatherName        = A.FatherName,                         
  MotherName        = A.MotherPresentName,                         
  Gender         = B.Gender,                          
  DOB          = FORMAT(A.DOB,'dd MMM, yyyy'),                          
  MobileNo        = A.MobileNo,                         
  EMailID         = A.EMailID,                        
  /*Category = K.CategoryCode,                  */  
  Category =C.StudentCategoryDisplay,  
  IsPWD = CASE WHEN  T.IsPWD = 1 AND EXISTS(SELECT DocumentID FROM ApplicationForm_DocumentDetails Doc WHERE IsDocumentUploaded=1 AND Doc.CandidateID=A.CandidateID             
  AND DocumentID=9 AND IsVerified=1 AND VerificationStatus='Y') THEN 'YES' ELSE 'NO' END,                
  IsOrphan = CASE WHEN  T.IsOrphan = 1 AND EXISTS(SELECT DocumentID FROM ApplicationForm_DocumentDetails Doc WHERE IsDocumentUploaded=1 AND Doc.CandidateID=A.CandidateID             
  AND DocumentID=8 AND IsVerified=1 AND VerificationStatus='Y') THEN 'YES' ELSE 'NO' END,                
  /*Category        = F.Category,                         
  DomicileDistrict      = A.DomicileDistrict,                         
  EligibilityQualification    = A.EligibilityQualification,                         
  EligibilityQualificationMarks   = CAST(A.MarksObtained AS VARCHAR) + ' / '                          
            + CAST(A.MarksOutOf AS VARCHAR)                         
            + ' (' + CAST(A.Percentage AS VARCHAR) + '%)',  */                       
  PhotoURL        = P.PhotoUploadedURL,                          
  SignURL         = P.SignUploadedURL,                        
  /*AcademicWeightage      = C.AcademicWeightage,                         
  [7/12Weightage]       = C.[7/12Weightage],                         
  NCCWeightage       = C.NCCWeightage,                         
  SportWeightage       = C.SportWeightage,                         
  MPKVEmployeeWeightage     = C.MPKVEmployeeWeightage,                         
  TotalWeightage       = C.TotalWeightage,  */                       
  MeritNo         = C.MeritNo,                          
  AllotmentPhaseID      = D.PhaseID,                          
  AllotmentPhase       = D.Phase,                           
  AllottedCollegeID      = E.CollegeID,                         
  AllottedCollegeCode      = E.CollegeCode,                         
  AllottedCollege       = E.CollegeName,                          
  AllottedCollegeDistrict     = E.District,                          
  /*AllottedCourse       = E.Course,                         
  AllottedCourseStatus     = E.CourseStatus,  */                       
  AllottedFaculty=F.FacultyName,                       
  AllottedSubject=S.SubjectName,                       
  AllottedPreferenceNo     = C.AllottedPreferenceNo,                          
  /*AllottedCategory      = G.CategoryCode,                         */  
   AllottedCategory      =C.AllottedCategoryDisplay,  
  --AllottedType       = C.AllottedType,               
   AllottedQuota = C.AllottedQuota,              
   SubjectCode = C.PHDCollegeCode,              
  C.RosterSeqNo AS RoasterSeqNo, 
  C.RoasterPoint as RoasterPoint,          
  ISNULL(C.RoasterCategory,'') as RoasterCategory,           
  ISNULL(C.AllottedGender,'') AS AllotedGender,          
  AllottedTypeDisplay      = C.AllottedTypeDisplay,                     
  AllottedNodalOfficerName =  E.NodalOfficerName,   AllottedNodalOfficerMobileNo=E.NodalOfficerContactNo,  AllottedNodalOfficerEMailID=E.NodalOfficerEmail,                    
  AllotmentDate       = FORMAT(C.AllotmentDate,'dddd, MMM dd, yyyy'),                         
  IsAllotmentLetterDownloaded    = CASE C.SeatAcceptanceStatus WHEN 'Y' THEN 'YES' ELSE 'NO' END,              
  AllotmentLetterDownloadedOn    = CASE C.SeatAcceptanceStatus WHEN 'Y' THEN ISNULL(FORMAT(C.SeatAcceptedDateTime,'dd MMM, yyyy hh:mm:ss tt'), '--') ELSE '--' END,                         
  AllotmentLetterDownloadedBy    = CASE C.SeatAcceptanceStatus WHEN 'Y' THEN C.SeatAcceptedBy ELSE '--' END,                         
  AllotmentLetterDownloadedByIPAddress = CASE C.SeatAcceptanceStatus WHEN 'Y' THEN C.SeatAcceptedByIPAddress ELSE '--' END,                         
  AdmissionComments      = C.AdmissionComments,                          
  ReportingStatus       = CASE C.ReportingStatus                          
             WHEN 'Y' THEN 'Admitted'                          
             WHEN 'R' THEN 'Rejected'                         
             WHEN 'C' THEN 'Cancelled'                         
    WHEN 'Z' THEN 'Candidate Refused Admission'          
             ELSE 'Not Reported'                          
            END,                 
  ReportedOn        = ISNULL(FORMAT(C.ReportedDateTime,'dd MMM, yyyy hh:mm:ss tt'), '--'),                          
  ReportedBy        = C.ReportedBy,                          
  ReportedByIPAddress      = C.ReportedByIPAddress,                          
  CancellationComments     = C.CancellationComments,                          
  CancelledOn        = ISNULL(FORMAT(C.CancelledDateTime,'dd MMM, yyyy hh:mm:ss tt'), '--'),                          
  CancelledBy        = C.CancelledBy,                     
  CancelledByIPAddress     = C.CancelledByIPAddress,                         
  PrintedOn        = FORMAT(dbo.fnGetISTDateTime(),'dd MMM, yyyy hh:mm:ss tt'),  
  C.ChoiceCode AS CollegeCode,  
  Master_University.UniversityName AS CandidateHomeUniversity ,
   ISNULL(C.CollegeAllottedType,'') AS CollegeAllottedType   
FROM                            
  /*VW_CandidateData (NOLOCK) A  */                       
  ApplicationForm_RegistrationDetails (NOLOCK) A                        
  INNER JOIN Master_Gender (NOLOCK) B ON A.GenderCode = B.GenderCode                         
  INNER JOIN ApplicationForm_PhotoAndSignDetails P ON A.CandidateID = P.CandidateID                         
  INNER JOIN College_AllotmentDetails (NOLOCK) C ON A.CandidateID = C.CandidateID                         
  INNER JOIN Master_Phase (NOLOCK) D ON C.PhaseID = D.PhaseID                         
  INNER JOIN viewAgriCollegeInformation (NOLOCK) E ON C.PHDCollegeCode = E.CollegeCode                         
  /*INNER JOIN Master_Category (NOLOCK) F ON C.EligibleCategoryID = F.CategoryID  */                     
  INNER JOIN ApplicationForm_CategoryAndOtherReservationDetails T ON A.CandidateID=T.CandidateID                     
  --INNER JOIN Master_Category (NOLOCK) K ON K.CategoryID=T.FinalCategoryID                     
  /*INNER JOIN Master_Category (NOLOCK) K ON K.CategoryID=C.StudentCategoryID                     
  INNER JOIN Master_Category (NOLOCK) G ON C.AllottedCategoryID = G.CategoryID                       */  
  JOIN Master_Faculty F ON F.FacultyID=E.FacultyID                        
  JOIN Master_FacultyWiseSubjects  S ON S.SubjectID=E.SubjectID  
  JOIN Master_University ON Master_University.UniversityID=C.StudentUniID   
WHERE                          
  C.PhaseID = @PhaseID AND A.CandidateID = @CandidateID                     
  --AND                         
  --((@Flag = 'ConfirmAdmission' AND C.ReportingStatus = 'N') OR (@Flag <> 'ConfirmAdmission' AND C.ReportingStatus = @ReportingStatus))                        
  END   
  
  
    

