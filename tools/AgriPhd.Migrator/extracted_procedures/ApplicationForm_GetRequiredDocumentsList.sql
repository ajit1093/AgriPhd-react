CREATE   PROCEDURE [dbo].[ApplicationForm_GetRequiredDocumentsList]  
 @CandidateID BIGINT,  
 @UserLoginID VARCHAR(50),          
 @PageCode VARCHAR(50)  
AS  
 DECLARE @IsAllCompulsoryDocumentsUploaded BIT = 1  
   
 IF EXISTS (SELECT 1 FROM ApplicationForm_DocumentDetails (NOLOCK) A INNER JOIN Master_Document (NOLOCK) B ON A.DocumentID = B.DocumentID WHERE A.CandidateID = @CandidateID AND B.IsCompulsory = 1 AND A.IsDocumentUploaded = 0)  
  BEGIN  
   SET @IsAllCompulsoryDocumentsUploaded = 0  
  END   
   
 SELECT   
  CandidateID           = A.CandidateID,  
  DocumentID           = A.DocumentID,  
   DocumentName = CASE WHEN B.IsCompulsory = 1   
                    THEN '<font color=red><b>* </b></font>' + B.Document   
                    ELSE B.Document   
               END  
+ CASE   
      WHEN A.DocumentID = 43 AND A.DocumentIssueDate IS NOT NULL THEN   
           ' (Application Receipt Number : ' + A.DocumentNo  
           + ', Application Receipt Date : ' + ISNULL(FORMAT(A.DocumentIssueDate, 'dd/MM/yyyy'), '')   
           + ', District Applied : ' + ISNULL(A.DocumentValidityReceiptDistrict, '') + ')'   
      WHEN A.DocumentIssueDate IS NOT NULL THEN    
           ' (Certificate No. : ' + A.DocumentNo   
           + ', Issue Date : ' + ISNULL(FORMAT(A.DocumentIssueDate, 'dd/MM/yyyy'), '')   
           + ')'   
      ELSE ''   
  END COLLATE SQL_Latin1_General_CP1_CI_AS,  
  DocumentGroup         = A.DocumentGroup,  
  IsDocumentUploaded       = A.IsDocumentUploaded,  
  DocumentUploadedURL      = A.DocumentUploadedURL,  
  IsCompulsory          = B.IsCompulsory,  
  IsVerified           = A.IsVerified,  
  VerificationStatus        = CASE WHEN A.IsVerified = 1 THEN CASE WHEN A.VerificationStatus = 'Y' THEN '<font color=green><b>Verified</b></font>' ELSE '<font color=red><b>Not Verified</b></font>' END ELSE '<font color=blue><b>Pending</b></font>' END,  
  VerificationComments       = A.VerificationComments,  
  IsAllCompulsoryDocumentsUploaded = @IsAllCompulsoryDocumentsUploaded  
 FROM   
  ApplicationForm_DocumentDetails (NOLOCK) A   
  INNER JOIN Master_Document (NOLOCK) B ON A.DocumentID = B.DocumentID  
 WHERE   
  A.CandidateID = @CandidateID  
 ORDER BY   
  SeqNo  
