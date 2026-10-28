CREATE PROCEDURE [dbo].[College_GetCollegeSummary]            
@CollegeID BIGINT            
AS          
BEGIN          
SELECT             
  A.CollegeID, A.CollegeCode, A.CollegeName,  
 -- A.CollegeAddress,  
  B.District,             
  T.Taluka, A.City,  A.PIN, A.CollegePhoneNo, A.CollegeEmail,            
  D.FacultyName,          
  dbo.fnGetSubjectNamesByCollegeCode(CollegeCode) AS CollegeSubjects ,           
  /*Course = C.Course + ' (MEDIUM : ' + D.Medium + ', DURATION : ' + CAST(C.Duration AS VARCHAR) + (CASE WHEN C.Duration > 1 THEN ' YEARS' ELSE ' YEAR' END) + ')',   )          
           
  E.CourseStatus, A.Intake, HasManagementQuota = CASE A.HasManagementQuota WHEN 1 THEN 'YES' ELSE 'NO' END,  */          
  /*A.PrincipalName, A.PrincipalEMailID, A.PrincipalMobileNo,*/          
  NodalOfficerName,NodalOfficerEmail,NodalOfficerContactNo,          
/*A.AdmissionInchargeName, A.AdmissionInchargeEMailID, A.AdmissionInchargeMobileNo, */          
 A.IsActive            
FROM            
  Master_College (NOLOCK) A            
  INNER JOIN Master_District (NOLOCK) B ON A.DistrictID = B.DistrictID            
  INNER JOIN Master_Taluka (NOLOCK) T ON A.TalukaID = T.TalukaID            
  INNER JOIN Master_Faculty D ON D.FacultyID=A.FacultyID            
 /*INNER JOIN Master_Course (NOLOCK) C ON A.CourseID = C.CourseID           
  INNER JOIN Master_Medium (NOLOCK) D ON C.MediumID = D.MediumID            
  INNER JOIN Master_CourseStatus (NOLOCK) E ON A.CourseStatusID = E.CourseStatusID   */          
WHERE            
  A.CollegeID = @CollegeID            
END       
