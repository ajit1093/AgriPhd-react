
CREATE     PROCEDURE [dbo].[Dashboard_GetCandidateDashboard] 
 @CandidateID BIGINT  
AS  
 SELECT   
  ApplicationFormStatus    = CASE FormStatus WHEN 'I' THEN 'Incomplete' WHEN 'C' THEN 'Complete | Not Locked' WHEN 'A' THEN 'Locked' END,  
  DocumentVerificationStatus = CASE WHEN IsFullyEVerified = 1 THEN 'Verified' ELSE CASE WHEN EXISTS (SELECT 1 FROM ApplicationForm_DocumentDetails (NOLOCK) WHERE CandidateID = @CandidateID AND IsVerified = 1) THEN 'Partially Verified' ELSE 'Not Verified' 
END END  
 FROM  
  ApplicationForm_Status (NOLOCK)  
 WHERE  
  CandidateID = @CandidateID  
  
 SELECT  
  B.Document, ISNULL(A.VerificationComments, '') AS Comments  
 FROM   
  ApplicationForm_DocumentDetails (NOLOCK) A  
  INNER JOIN Master_Document (NOLOCK) B ON A.DocumentID = B.DocumentID  
 WHERE   
  A.CandidateID = @CandidateID AND A.IsVerified = 1 AND (A.VerificationStatus = 'N' OR A.VerificationStatus = 'H')

