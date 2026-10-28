CREATE   PROCEDURE [dbo].[ApplicationForm_SaveRequiredDocumentUploadStatus]  
 @CandidateID BIGINT,  
 @DocumentID SMALLINT,  
 @DocumentUploadedURL VARCHAR(1000),  
 @DocumentNo VARCHAR(50),   
 @DocumentIssueDate DATE,
 @DocumentValidityReceiptDistrict VARCHAR(50), 
 @Action CHAR(1),  
 @UserLoginID VARCHAR(50),    
 @IPAddress VARCHAR(50),        
 @PageCode VARCHAR(50)  
AS  
 DECLARE @IsEligible BIT = 0  
 DECLARE @ErrMsg VARCHAR(250) = ''  
 DECLARE @IsInnerProcOk BIT = 0  
 DECLARE @IsDone VARCHAR(500) = 'N'  
  
 BEGIN TRY  
  
  SELECT @IsEligible = ISNULL(IsEligible, 0), @ErrMsg = ErrMsg FROM dbo.fnCheckApplicationFormFillingEligiblity(@CandidateID, @UserLoginID)  
    
  IF (@IsEligible = 1)  
   BEGIN  
    BEGIN TRAN  
  
    IF (@Action = 'U')  
     BEGIN  
      UPDATE ApplicationForm_DocumentDetails  
      SET IsDocumentUploaded = 1, DocumentUploadedURL = @DocumentUploadedURL, DocumentNo = ISNULL(@DocumentNo, ''), DocumentIssueDate = @DocumentIssueDate,DocumentValidityReceiptDistrict = @DocumentValidityReceiptDistrict, DocumentUploadedDateTime = dbo.fnGetISTDateTime(), DocumentUploadedBy = @UserLoginID, DocumentUploadedByIPAddress = @IPAddress, IsVerified = 0, VerificationStatus = 'N', VerificationComments = '', ModifiedDateTime = dbo.fnGetISTDateTime(), ModifiedBy = @UserLoginID, ModifiedByIPAddress = @IPAddress    
      WHERE CandidateID = @CandidateID AND DocumentID = @DocumentID  
     END  
    ELSE IF (@Action = 'D')  
     BEGIN  
      UPDATE ApplicationForm_DocumentDetails  
      SET IsDocumentUploaded = 0, DocumentUploadedURL = '', DocumentNo = '', DocumentIssueDate = NULL,DocumentValidityReceiptDistrict =NULL, DocumentUploadedDateTime = NULL, DocumentUploadedBy = '', DocumentUploadedByIPAddress = '', IsVerified = 0, VerificationStatus = 'N', VerificationComments = '', ModifiedDateTime = dbo.fnGetISTDateTime(), ModifiedBy = @UserLoginID, ModifiedByIPAddress = @IPAddress      
      WHERE CandidateID = @CandidateID AND DocumentID = @DocumentID  
     END  
      
    INSERT INTO ApplicationForm_DocumentDetails_History (CandidateID, DocumentID, DocumentGroup, IsDocumentUploaded, DocumentUploadedURL, DocumentNo, DocumentIssueDate,DocumentValidityReceiptDistrict, DocumentUploadedDateTime, DocumentUploadedBy, DocumentUploadedByIPAddress, IsVerified,
 VerificationStatus, VerificationComments, VerifiedDateTime, VerifiedBy, VerifiedByIPAddress, [Action], ModifiedDateTime, ModifiedBy, ModifiedByIPAddress)  
    SELECT CandidateID, DocumentID, DocumentGroup, IsDocumentUploaded, DocumentUploadedURL, DocumentNo, DocumentIssueDate,DocumentValidityReceiptDistrict, DocumentUploadedDateTime, DocumentUploadedBy, DocumentUploadedByIPAddress, IsVerified, VerificationStatus, VerificationComments, VerifiedDateTime, VerifiedBy, VerifiedByIPAddress, @Action, dbo.fnGetISTDateTime(), @UserLoginID, @IPAddress FROM ApplicationForm_DocumentDetails (NOLOCK) WHERE CandidateID = @CandidateID AND DocumentID = @DocumentID  
      
    SET @PageCode = @PageCode + ' - ' + @Action  
  
    EXEC ApplicationForm_UpdateStatus @CandidateID, @UserLoginID, @PageCode, @IPAddress, @IsInnerProcOk OUTPUT  
                  
    IF (@IsInnerProcOk = 1)  
     BEGIN   
      COMMIT TRAN                                                                                    
      SET @IsDone = 'Y'  
     END   
    ELSE  
     BEGIN  
      ROLLBACK TRAN  
      SET @IsDone = 'N'  
     END  
   END   
  ELSE  
   BEGIN  
    SET @IsDone = @ErrMsg  
   END  
 END TRY  
 BEGIN CATCH  
  IF(@@TRANCOUNT > 0)  
   ROLLBACK TRAN  
     
  SET @IsDone = 'N'  
     
  INSERT INTO Log_ErrorDetails(LogSource, ErrorMessage, LogDate, UserLoginID)  
  VALUES(ERROR_PROCEDURE(), ERROR_MESSAGE(), dbo.fnGetISTDateTime(), @UserLoginID)   
 END CATCH  
   
 SELECT @IsDone AS IsOk  
