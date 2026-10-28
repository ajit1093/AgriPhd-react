CREATE   PROCEDURE [dbo].[ApplicationForm_LockForm]            
 @CandidateID BIGINT,            
 @UserLoginID VARCHAR(50),            
 @IPAddress VARCHAR(50),            
 @PageCode VARCHAR(50)            
AS            
 DECLARE @IsEligible BIT = 0            
 DECLARE @ErrMsg VARCHAR(250) = ''            
 DECLARE @IsInnerProcOk BIT = 0            
 DECLARE @IsDone VARCHAR(500) = 'N'            
 DECLARE @ApplicationFormNo VARCHAR(100)          
 DECLARE @LastNumber INT;        
 DECLARE @NewNumber INT;        
        
 BEGIN TRY            
  SELECT @IsEligible = IsEligible, @ErrMsg = ErrMsg FROM dbo.fnCheckApplicationFormFillingEligiblity(@CandidateID, @UserLoginID)            
            
  IF (@IsEligible = 1)            
   BEGIN            
    SELECT @IsEligible = IsFinalEligible, @ErrMsg = Reason FROM dbo.fnCheckCandidateFinalEligiblity(@CandidateID)            
            
    IF (@IsEligible = 1)            
     BEGIN            
      BEGIN TRAN            
            
      IF EXISTS (SELECT 1 FROM ApplicationForm_ConfirmationDetails (NOLOCK) WHERE CandidateID = @CandidateID)            
       BEGIN            
        UPDATE ApplicationForm_ConfirmationDetails            
        SET IsConfirmed = 1, ConfirmedDateTime = [dbo].[fnGetISTDateTime](), ConfirmedBy = @UserLoginID, ConfirmedByIPAddress = @IPAddress, ModifiedDateTime = [dbo].[fnGetISTDateTime](), ModifiedBy = @UserLoginID, ModifiedByIPAddress = @IPAddress         
  
   
        WHERE CandidateID = @CandidateID            
       END            
      ELSE            
       BEGIN          
        
 ---        
   --SELECT @LastNumber = MAX(CAST(SUBSTRING(ApplicationFormNo, 15, 6) AS INT))        
   SELECT @LastNumber = MAX(CAST(SUBSTRING(ApplicationFormNo, 12, 5) AS INT))        
    FROM ApplicationForm_RegistrationDetails        
   WITH (TABLOCKX, HOLDLOCK);        
        
   -- If no records exist, start with 1        
   IF @LastNumber IS NULL        
   BEGIN        
    SET @LastNumber = 0;        
   END        
        
   -- Increment the last number by 1        
   SET @NewNumber = @LastNumber + 1;        
        
   -- Combine the prefix with the new number        
    SET @ApplicationFormNo = 'MCAER-PHD25' + RIGHT('00000' + CAST(@NewNumber AS VARCHAR(5)), 5);  
        
 ----        
   UPDATE ApplicationForm_RegistrationDetails SET ApplicationFormNo=@ApplicationFormNo WHERE CandidateID=@CandidateID          
  --          
        INSERT INTO ApplicationForm_ConfirmationDetails (CandidateID, IsConfirmed, ConfirmedDateTime, ConfirmedBy, ConfirmedByIPAddress, CreatedDateTime, CreatedBy, CreatedByIPAddress)            
        VALUES (@CandidateID, 1, [dbo].[fnGetISTDateTime](), @UserLoginID, @IPAddress, [dbo].[fnGetISTDateTime](), @UserLoginID, @IPAddress)            
       END            
            
      INSERT INTO ApplicationForm_ConfirmationDetails_History (CandidateID, IsConfirmed, ConfirmedDateTime, ConfirmedBy, ConfirmedByIPAddress, CancelledDateTime, CancelledBy, CancelledByIPAddress, ModifiedDateTime, ModifiedBy, ModifiedByIPAddress)        
  
    
      SELECT CandidateID, IsConfirmed, ConfirmedDateTime, ConfirmedBy, ConfirmedByIPAddress, CancelledDateTime, CancelledBy, CancelledByIPAddress, [dbo].[fnGetISTDateTime](), @UserLoginID, @IPAddress FROM ApplicationForm_ConfirmationDetails (NOLOCK) WHERE
  
    
      
 CandidateID = @CandidateID        
            
      UPDATE ApplicationForm_Status             
      SET VersionNo = VersionNo + 1, StepID = StepID + 1, FormStatus = 'A', LastModifiedOn = [dbo].[fnGetISTDateTime](), LastModifiedBy = @UserLoginID, LastModifiedByIPAddress = @IPAddress, LastModifiedPage = @PageCode            
      WHERE CandidateID = @CandidateID AND FormStatus = 'C'             
            
      IF NOT EXISTS (SELECT 1 FROM ApplicationForm_DocumentDetails (NOLOCK) A INNER JOIN Master_Document (NOLOCK) B ON A.DocumentID = B.DocumentID WHERE CandidateID = @CandidateID AND A.VerificationStatus = 'N' AND B.IsCompulsory = 1)            
       BEGIN                    UPDATE ApplicationForm_Status SET IsFullyEVerified = 1 WHERE CandidateID = @CandidateID            
       END             
      ELSE          
       BEGIN            
        UPDATE ApplicationForm_Status SET IsFullyEVerified = 0 WHERE CandidateID = @CandidateID            
       END       
                  
      INSERT INTO ApplicationForm_Status_History (CandidateID, VersionNo, StepID, FormStatus, LastModifiedOn, LastModifiedBy, LastModifiedByIPAddress, LastModifiedPage, IsFullyEVerified)            
      SELECT CandidateID, VersionNo, StepID, FormStatus, LastModifiedOn, LastModifiedBy, LastModifiedByIPAddress, LastModifiedPage, IsFullyEVerified FROM ApplicationForm_Status (NOLOCK) WHERE CandidateID = @CandidateID            
            
      INSERT INTO ApplicationForm_History (CandidateID, ApplicationID, VersionNo, StepID, FormStatus, LastModifiedOn, LastModifiedBy, LastModifiedByIPAddress, LastModifiedPage, LockedDateTime, LockedBy, LockedByIPAddress)            
      SELECT CandidateID, ApplicationID, VersionNo, StepID, FormStatus, LastModifiedOn, LastModifiedBy, LastModifiedByIPAddress, LastModifiedPage, LockedDateTime, LockedBy, LockedByIPAddress FROM viewApplicationForm (NOLOCK) WHERE         
   CandidateID = @CandidateID            
           
      COMMIT TRAN            
      SET @IsDone = 'Y'            
     END                 
    ELSE            
     BEGIN            
      SET @IsDone = @ErrMsg            
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
  VALUES(ERROR_PROCEDURE(), ERROR_MESSAGE() + ' AT ' + CAST(ERROR_LINE() AS VARCHAR(10)) + ' For Form No '  + CAST(@CandidateID AS VARCHAR(20)) , [dbo].[fnGetISTDateTime](), @UserLoginID)             
 END CATCH            
             
 SELECT @IsDone AS IsOk 
