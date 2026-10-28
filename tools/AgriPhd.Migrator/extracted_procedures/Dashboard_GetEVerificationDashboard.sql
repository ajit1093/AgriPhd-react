CREATE PROCEDURE [dbo].[Dashboard_GetEVerificationDashboard]  
 @UserID BIGINT  
AS  
 DECLARE @UserTypeID INT = 0  
 DECLARE @CandidateList TABLE (CandidateID BIGINT, EVCID BIGINT, IsNotVerified SMALLINT, IsPartiallyVerified SMALLINT, IsRejected SMALLINT, IsFullyVerified SMALLINT, ReportingStatus CHAR(1))  
    
 SELECT @UserTypeID = UserTypeID FROM Master_user (NOLOCK) WHERE UserID = @UserID  
  
 INSERT INTO @CandidateList (CandidateID, EVCID, IsNotVerified, IsPartiallyVerified, IsRejected, IsFullyVerified, ReportingStatus)  
 SELECT   
  CandidateID    = A.CandidateID,  
  EVCID      = ISNULL(B.EVCID, 0),  
  IsNotVerified   = CASE WHEN A.IsFullyEVerified = 0 AND EXISTS (SELECT 1 FROM ApplicationForm_DocumentDetails (NOLOCK) D WHERE D.CandidateID = A.CandidateID AND D.IsVerified = 1) THEN CAST(0 AS BIT) ELSE CAST(1 AS BIT) END,  
  IsPartiallyVerified = CASE WHEN A.IsFullyEVerified = 0 AND EXISTS (SELECT 1 FROM ApplicationForm_DocumentDetails (NOLOCK) D WHERE D.CandidateID = A.CandidateID AND D.IsVerified = 0) THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END,  
  IsRejected    = CASE WHEN A.IsFullyEVerified = 0 AND EXISTS (SELECT 1 FROM ApplicationForm_DocumentDetails (NOLOCK) D WHERE D.CandidateID = A.CandidateID AND D.IsVerified = 1 AND D.VerificationStatus = 'N') THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END,  
  IsFullyVerified   = A.IsFullyEVerified,  
  --ReportingStatus  = ISNULL(C.ReportingStatus, 'N')  //For Round I commented
  ReportingStatus  = 'N'
 FROM   
  ApplicationForm_Status (NOLOCK) A   
  LEFT JOIN ApplicationForm_EVCDetails (NOLOCK) B ON A.CandidateID = B.CandidateID  
  --LEFT JOIN College_AllotmentDetails (NOLOCK) C ON B.CandidateID = C.CandidateID AND C.ReportingStatus = 'Y'  
 WHERE  
  A.FormStatus = 'A'   
  
 IF (@UserTypeID = 41)  
  BEGIN  
   --For Round-1 
   /*SELECT   
    Total     = CAST((SELECT COUNT(*) FROM @CandidateList WHERE ReportingStatus = 'N') AS VARCHAR) + ' + ' + CAST((SELECT COUNT(*) FROM @CandidateList WHERE ReportingStatus = 'Y') AS VARCHAR),     
    FullyVerified  = CAST((SELECT COUNT(*) FROM @CandidateList WHERE EVCID > 0 AND IsFullyVerified = 1 AND ReportingStatus = 'N') AS VARCHAR) + ' + ' + CAST((SELECT COUNT(*) FROM @CandidateList WHERE EVCID > 0 AND IsFullyVerified = 1 AND 
	ReportingStatus = 'Y') AS VARCHAR),  
    PartiallyVerified = CAST((SELECT COUNT(*) FROM @CandidateList WHERE EVCID > 0 AND IsNotVerified = 0 AND IsPartiallyVerified = 0 AND IsRejected = 1 AND IsFullyVerified = 0 AND ReportingStatus = 'N') AS VARCHAR) + ' + ' + CAST((SELECT COUNT(*) FROM 
	@CandidateList WHERE EVCID > 0 AND IsNotVerified = 0 AND IsPartiallyVerified = 0 AND IsRejected = 1 AND IsFullyVerified = 0 AND ReportingStatus = 'Y') AS VARCHAR),  
    NotAssigned   = CAST((SELECT COUNT(*) FROM @CandidateList WHERE EVCID = 0 AND ReportingStatus = 'N') AS VARCHAR) + ' + ' + CAST((SELECT COUNT(*) FROM @CandidateList WHERE EVCID = 0 AND ReportingStatus = 'Y') AS VARCHAR),  
    NotVerified   = CAST((SELECT COUNT(*) FROM @CandidateList WHERE EVCID > 0 AND IsNotVerified = 1 AND IsPartiallyVerified = 1 AND IsRejected = 0 AND IsFullyVerified = 0 AND ReportingStatus = 'N') AS VARCHAR) + ' + ' + 
	CAST((SELECT COUNT(*) FROM @CandidateList WHERE EVCID > 0 AND  IsNotVerified = 1 AND IsPartiallyVerified = 1 AND IsRejected = 0 AND IsFullyVerified = 0 AND ReportingStatus = 'Y') AS VARCHAR),  
    ReUploaded   = CAST((SELECT COUNT(*) FROM @CandidateList WHERE EVCID > 0 AND IsNotVerified = 0 AND IsPartiallyVerified = 1 AND IsFullyVerified = 0 AND ReportingStatus = 'N') AS VARCHAR) + ' + ' + 
	CAST((SELECT COUNT(*) FROM @CandidateList WHERE EVCID > 0 AND IsNotVerified = 0 AND IsPartiallyVerified = 1 AND IsFullyVerified = 0 AND ReportingStatus = 'Y') AS VARCHAR)  */

	
   SELECT   
    Total     = CAST((SELECT COUNT(*) FROM @CandidateList WHERE ReportingStatus = 'N') AS VARCHAR) + ' + ' + CAST((SELECT COUNT(*) FROM @CandidateList WHERE ReportingStatus = 'Y') AS VARCHAR),     
    FullyVerified  = CAST((SELECT COUNT(*) FROM @CandidateList WHERE /*EVCID > 0 AND*/ EVCID = 0 AND IsFullyVerified = 1 AND ReportingStatus = 'N') AS VARCHAR) + ' + ' + CAST((SELECT COUNT(*) FROM @CandidateList WHERE EVCID > 0 AND IsFullyVerified = 1 AND 
	ReportingStatus = 'Y') AS VARCHAR),  
    PartiallyVerified = CAST((SELECT COUNT(*) FROM @CandidateList WHERE /*EVCID > 0 AND*/ EVCID = 0  AND IsNotVerified = 0 AND IsPartiallyVerified = 0 AND IsRejected = 1 AND IsFullyVerified = 0 AND ReportingStatus = 'N') AS VARCHAR) + ' + ' + CAST((SELECT COUNT(*) FROM 
	@CandidateList WHERE EVCID > 0 AND IsNotVerified = 0 AND IsPartiallyVerified = 0 AND IsRejected = 1 AND IsFullyVerified = 0 AND ReportingStatus = 'Y') AS VARCHAR),  
    NotAssigned   = CAST((SELECT COUNT(*) FROM @CandidateList WHERE EVCID = 0 AND ReportingStatus = 'N') AS VARCHAR) + ' + ' + CAST((SELECT COUNT(*) FROM @CandidateList WHERE EVCID = 0 AND ReportingStatus = 'Y') AS VARCHAR),  
    NotVerified   = CAST((SELECT COUNT(*) FROM @CandidateList WHERE /*EVCID > 0*/   IsNotVerified = 1 AND IsPartiallyVerified = 1 AND IsRejected = 0 AND IsFullyVerified = 0 AND ReportingStatus = 'N') AS VARCHAR) + ' + ' + 
	CAST((SELECT COUNT(*) FROM @CandidateList WHERE EVCID > 0 AND  IsNotVerified = 1 AND IsPartiallyVerified = 1 AND IsRejected = 0 AND IsFullyVerified = 0 AND ReportingStatus = 'Y') AS VARCHAR),  
    ReUploaded   = CAST((SELECT COUNT(*) FROM @CandidateList WHERE /*EVCID > 0*/ EVCID = 0  AND IsNotVerified = 0 AND IsPartiallyVerified = 1 AND IsFullyVerified = 0 AND ReportingStatus = 'N') AS VARCHAR) + ' + ' + 
	CAST((SELECT COUNT(*) FROM @CandidateList WHERE EVCID > 0 AND IsNotVerified = 0 AND IsPartiallyVerified = 1 AND IsFullyVerified = 0 AND ReportingStatus = 'Y') AS VARCHAR)  

  END  
 ELSE  
  BEGIN  
   SELECT   
    Total     = CAST((SELECT COUNT(*) FROM @CandidateList WHERE EVCID = @UserID AND ReportingStatus = 'N') AS VARCHAR) + ' + ' + CAST((SELECT COUNT(*) FROM @CandidateList WHERE EVCID = @UserID AND ReportingStatus = 'Y') AS VARCHAR),     
    FullyVerified  = CAST((SELECT COUNT(*) FROM @CandidateList WHERE EVCID = @UserID AND IsFullyVerified = 1 AND ReportingStatus = 'N') AS VARCHAR) + ' + ' + CAST((SELECT COUNT(*) FROM @CandidateList WHERE EVCID = @UserID AND IsFullyVerified = 1 AND 
	ReportingStatus = 'Y') AS VARCHAR),  
    PartiallyVerified = CAST((SELECT COUNT(*) FROM @CandidateList WHERE EVCID = @UserID AND IsNotVerified = 0 AND IsPartiallyVerified = 0 AND IsRejected = 1 AND IsFullyVerified = 0 AND ReportingStatus = 'N') AS VARCHAR) + ' + ' + CAST((SELECT COUNT(*) 
	FROM @CandidateList WHERE EVCID = @UserID AND IsNotVerified = 0 AND IsPartiallyVerified = 0 AND IsRejected = 1 AND IsFullyVerified = 0 AND ReportingStatus = 'Y') AS VARCHAR),  
    NotAssigned   = CAST((SELECT COUNT(*) FROM @CandidateList WHERE EVCID = @UserID AND ReportingStatus = 'N') AS VARCHAR) + ' + ' + CAST((SELECT COUNT(*) FROM @CandidateList WHERE EVCID = @UserID AND ReportingStatus = 'Y') AS VARCHAR),  
    NotVerified   = CAST((SELECT COUNT(*) FROM @CandidateList WHERE EVCID = @UserID AND IsNotVerified = 1 AND IsPartiallyVerified = 1 AND IsRejected = 0 AND IsFullyVerified = 0 AND ReportingStatus = 'N') AS VARCHAR) + ' + ' + CAST((SELECT COUNT(*) FROM 
	@CandidateList WHERE EVCID = @UserID AND IsNotVerified = 1 AND IsPartiallyVerified = 1 AND IsRejected = 0 AND IsFullyVerified = 0 AND ReportingStatus = 'Y') AS VARCHAR),  
    ReUploaded   = CAST((SELECT COUNT(*) FROM @CandidateList WHERE EVCID = @UserID AND IsNotVerified = 0 AND IsPartiallyVerified = 1 AND IsFullyVerified = 0 AND ReportingStatus = 'N') AS VARCHAR) + ' + ' + CAST((SELECT COUNT(*) FROM @CandidateList WHERE 
	EVCID = @UserID AND IsNotVerified = 0 AND IsPartiallyVerified = 1 AND IsFullyVerified = 0 AND ReportingStatus = 'Y') AS VARCHAR)  
  END  

