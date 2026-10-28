CREATE PROCEDURE [dbo].[ApplicationForm_SaveAddressDetails]    
 @CandidateID BIGINT,    
 @AddressLine1 VARCHAR(150),     
 @AddressLine2 VARCHAR(150),     
 @StateID SMALLINT,     
 @DistrictID SMALLINT,     
 @City VARCHAR(50),    
 @TalukaID SMALLINT,  
 @Taluka VARCHAR(50),     
 @Pincode VARCHAR(6),     
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
    
    IF EXISTS (SELECT 1 FROM ApplicationForm_AddressDetails (NOLOCK) WHERE CandidateID = @CandidateID)    
     BEGIN    
      UPDATE ApplicationForm_AddressDetails    
      SET AddressLine1 = @AddressLine1, AddressLine2 = @AddressLine2, StateID = @StateID, DistrictID = @DistrictID, City = @City,TalukaID=@TalukaID,
		Taluka=@Taluka,Pincode = @Pincode, ModifiedDateTime = dbo.fnGetISTDateTime(), ModifiedBy = @UserLoginID, ModifiedByIPAddress = @IPAddress    
      WHERE CandidateID = @CandidateID    
     END     
    ELSE    
     BEGIN    
      INSERT INTO ApplicationForm_AddressDetails (CandidateID, AddressLine1, AddressLine2, StateID, DistrictID, City,TalukaID,Taluka, Pincode, CreatedDateTime, CreatedBy, CreatedByIPAddress)    
      VALUES (@CandidateID, @AddressLine1, @AddressLine2, @StateID, @DistrictID, @City,@TalukaID,@Taluka, @Pincode, dbo.fnGetISTDateTime(), @UserLoginID, @IPAddress)    
     END     
    
    IF EXISTS (SELECT 1 FROM ApplicationForm_AddressDetails (NOLOCK) WHERE CandidateID = @CandidateID)    
     BEGIN    
      EXEC ApplicationForm_SetRequiredDocuments @CandidateID, @UserLoginID, @PageCode, @IPAddress, @IsInnerProcOk OUTPUT    
    
      IF(@IsInnerProcOk = 1)    
       BEGIN    
        SET @IsInnerProcOk = 0    
        EXEC ApplicationForm_UpdateStatus @CandidateID, @UserLoginID, @PageCode, @IPAddress, @IsInnerProcOk OUTPUT    
       END     
             
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
