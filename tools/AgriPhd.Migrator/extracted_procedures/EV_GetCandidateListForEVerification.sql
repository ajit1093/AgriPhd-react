      
CREATE PROCEDURE [dbo].[EV_GetCandidateListForEVerification]      
 @ApplicationStatus CHAR(1),      
 @UserLoginID VARCHAR(50)      
AS      
 DECLARE @UserTypeID INT = 0      
 DECLARE @UserID BIGINT = 0      
 DECLARE @CandidateList TABLE (SrNo BIGINT,  CandidateID BIGINT, ApplicationID VARCHAR(15), CandidateName VARCHAR(150), Category VARCHAR(50), IsNotVerified SMALLINT, IsPartiallyVerified SMALLINT, IsRejected SMALLINT,     
 IsOnHold SMALLINT,IsFullyVerified SMALLINT, ApplicationFormLastModifiedOn DATETIME, AssignedTo VARCHAR(50),ApplicationFormNo VARCHAR(16))      
        
 SELECT @UserTypeID = UserTypeID, @UserID = UserID FROM Master_user (NOLOCK) WHERE UserLoginID = @UserLoginID      
      
 INSERT INTO @CandidateList (SrNo,  CandidateID, ApplicationID, CandidateName, Category, IsNotVerified, IsPartiallyVerified, IsRejected, IsOnHold,IsFullyVerified, ApplicationFormLastModifiedOn, AssignedTo,ApplicationFormNo)      
 SELECT       
  SrNo       = ROW_NUMBER() OVER (ORDER BY D.LastModifiedOn),      
  --AppliedCourse     = G.Course,      
  CandidateID      = A.CandidateID,      
  ApplicationID     = A.ApplicationID,      
  CandidateName     = A.CandidateName,      
  Category      = C.CategoryCode,      
  IsNotVerified     = CASE WHEN D.IsFullyEVerified = 0 AND EXISTS (SELECT 1 FROM ApplicationForm_DocumentDetails (NOLOCK) D WHERE D.CandidateID = A.CandidateID AND D.IsVerified = 1) THEN CAST(0 AS BIT) ELSE CAST(1 AS BIT) END,      
  IsPartiallyVerified    = CASE WHEN D.IsFullyEVerified = 0 AND EXISTS (SELECT 1 FROM ApplicationForm_DocumentDetails (NOLOCK) D WHERE D.CandidateID = A.CandidateID AND D.IsVerified = 0) THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END,      
  IsRejected      = CASE WHEN D.IsFullyEVerified = 0 AND EXISTS (SELECT 1 FROM ApplicationForm_DocumentDetails (NOLOCK) D WHERE D.CandidateID = A.CandidateID AND D.IsVerified = 1 AND D.VerificationStatus = 'N') THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END,
  IsOnHold      = CASE WHEN D.IsFullyEVerified = 0 AND EXISTS (SELECT 1 FROM ApplicationForm_DocumentDetails (NOLOCK) D WHERE D.CandidateID = A.CandidateID AND D.IsVerified = 1 AND D.VerificationStatus = 'H') THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END,
  
    
      
  IsFullyVerified     = D.IsFullyEVerified,      
  ApplicationFormLastModifiedOn = D.LastModifiedOn,      
  AssignedTo      = ISNULL(F.EVCCode, '--'),    
  ApplicationFormNo = A.ApplicationFormNo    
 FROM       
  ApplicationForm_RegistrationDetails (NOLOCK) A      
  INNER JOIN ApplicationForm_CategoryAndOtherReservationDetails (NOLOCK) B ON A.CandidateID = B.CandidateID      
  INNER JOIN Master_Category (NOLOCK) C ON B.FinalCategoryID = C.CategoryID      
  INNER JOIN ApplicationForm_Status (NOLOCK) D ON A.CandidateID = D.CandidateID      
  LEFT JOIN ApplicationForm_EVCDetails (NOLOCK) E ON A.CandidateID = E.CandidateID      
  LEFT JOIN Master_EVC (NOLOCK) F ON E.EVCID = F.EVCID      
  --INNER JOIN Master_Course (NOLOCK) G ON A.AppliedCourseID = G.CourseID      
 WHERE      
  (E.EVCID IS NULL OR E.EVCID = @UserID OR @UserTypeID = 41) AND D.FormStatus = 'A'       
  AND A.CandidateID NOT IN (SELECT CandidateID FROM College_AllotmentDetails (NOLOCK) WHERE ReportingStatus = 'Y')      
         
  IF (@ApplicationStatus = 'N') -- Not Verified      
  BEGIN      
   SELECT ROW_NUMBER() OVER (ORDER BY  ApplicationFormLastModifiedOn) AS SrNo,  CandidateID, ApplicationID, CandidateName, Category, IsNotVerified, IsPartiallyVerified, IsRejected, IsFullyVerified, AssignedTo,ApplicationFormNo     
   FROM @CandidateList      
   WHERE IsNotVerified = 1 AND IsPartiallyVerified = 1 AND IsRejected = 0 AND IsFullyVerified = 0      
   ORDER BY SrNo      
  END   
 ELSE  IF (@ApplicationStatus = 'H') -- Not Verified      
  BEGIN      
   SELECT ROW_NUMBER() OVER (ORDER BY  ApplicationFormLastModifiedOn) AS SrNo,  CandidateID, ApplicationID, CandidateName, Category, IsNotVerified, IsPartiallyVerified, IsRejected, IsFullyVerified, AssignedTo,ApplicationFormNo     
   FROM @CandidateList      
   WHERE IsOnHold= 1 AND IsRejected = 0 AND IsFullyVerified = 0      
   ORDER BY SrNo      
  END   
 ELSE IF (@ApplicationStatus = 'P') -- Re-Uploaded      
  BEGIN      
   SELECT ROW_NUMBER() OVER (ORDER BY  ApplicationFormLastModifiedOn) AS SrNo,  CandidateID, ApplicationID, CandidateName, Category, IsNotVerified, IsPartiallyVerified, IsRejected, IsFullyVerified, AssignedTo,ApplicationFormNo       
   FROM @CandidateList       
   WHERE IsNotVerified = 0 AND IsPartiallyVerified = 1 AND IsFullyVerified = 0      
   ORDER BY SrNo       
  END       
 ELSE IF (@ApplicationStatus = 'R') -- Partially Verified      
  BEGIN      
   SELECT ROW_NUMBER() OVER (ORDER BY  ApplicationFormLastModifiedOn) AS SrNo,  CandidateID, ApplicationID, CandidateName, Category, IsNotVerified, IsPartiallyVerified, IsRejected, IsFullyVerified, AssignedTo,ApplicationFormNo       
   FROM @CandidateList      
   WHERE IsNotVerified = 0 AND IsPartiallyVerified = 0 AND IsRejected = 1 AND IsFullyVerified = 0      
   ORDER BY SrNo      
  END        
 ELSE IF (@ApplicationStatus = 'F') -- Fully Verified      
  BEGIN      
   SELECT ROW_NUMBER() OVER (ORDER BY  ApplicationFormLastModifiedOn) AS SrNo,  CandidateID, ApplicationID, CandidateName, Category, IsNotVerified, IsPartiallyVerified, IsRejected, IsFullyVerified, AssignedTo,ApplicationFormNo      
   FROM @CandidateList       
   WHERE IsFullyVerified = 1      
   ORDER BY SrNo      
  END 
