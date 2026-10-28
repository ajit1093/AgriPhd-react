      
        
CREATE     PROCEDURE [dbo].[ApplicationForm_GetRegisteredCandidate]  -- 242000429,'1998-06-21'           
    @ApplicationFormNo BIGINT,              
    @DOB VARCHAR(50)            
AS              
BEGIN              
    SET NOCOUNT ON;              
              
    SELECT  DISTINCT             
        loginExists = CASE WHEN EXISTS (SELECT 1 FROM Master_User WHERE UserLoginID = mc.ApplicationFormNo AND UserTypeID = 91) THEN 1 ELSE 0 END,              
        mc.ApplicationFormNo,              
        mc.CandidateName,              
        mc.DOB,             
  mc.MobileNo,            
        mcr.SeatNo,              
        mcr.CETScore,              
        mf.FacultyName,      
  PHD.SubjectName AS PGSubjectName ,     
  mc.emailID    
  --PG.PGSubjectName      
    FROM               
        Master_Candidate mc (NOLOCK)              
    JOIN               
        Master_CandidateResult mcr (NOLOCK) ON mc.ApplicationFormNo = mcr.ApplicationFormNo              
    JOIN               
        Master_Faculty mf (NOLOCK) ON mcr.FacultyID = mf.FacultyID          
 JOIN       
  Master_PGPHDSubjectMapping M ON mcr.CETSubjectID = M.PHDSubjectID      
 JOIN      
  Master_FacultyWiseSubjects PHD ON PHD.SubjectID = M.PHDSubjectID AND PHD.FacultyID = MF.FacultyID      
  --Master_PGSubject PG ON M.PGSubjectID = PG.PGSubjectID      
    WHERE               
        mc.ApplicationFormNo = @ApplicationFormNo 
		AND CONVERT(VARCHAR,mc.DOB,103) = @DOB 
		--AND mc.DOB = @DOB
		AND mf.IsActive = 1;       
END; 
