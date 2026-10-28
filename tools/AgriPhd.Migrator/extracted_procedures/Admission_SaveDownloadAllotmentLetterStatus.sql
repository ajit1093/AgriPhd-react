    
CREATE PROCEDURE [dbo].[Admission_SaveDownloadAllotmentLetterStatus]                    
 @PhaseID SMALLINT,                    
 @CandidateID BIGINT,                    
 @ChoiceCode BIGINT,                    
 @IsAccepted BIT,                  
 @IsRefused BIT,                
 @UserLoginID VARCHAR(50),                    
 @IPAddress VARCHAR(50),      
 @RefusalReason VARCHAR(100),      
 @IsLoad VARCHAR(1)      
AS                    
 DECLARE @LoggedInUserTypeID INT = 0                     
 DECLARE @DownloadAllotmentLetterRemainingFee INT = 0                    
 DECLARE @AllottedChoiceCode BIGINT = 0                    
 DECLARE @IsAllotmentLetterDownloaded BIT = 0                    
 DECLARE @IsCurrentPhase BIT = 0                    
 DECLARE @AdmissionStartDate DATETIME                    
 DECLARE @AdmissionEndDate DATETIME                    
 DECLARE @IsEligible BIT = 1                    
 DECLARE @ErrMsg VARCHAR(250) = ''                    
 DECLARE @IsDone VARCHAR(500) = 'N'                    
 DECLARE  @ReportingStatus VARCHAR(5)        
        
 BEGIN TRY                    
                
  SELECT @LoggedInUserTypeID = UserTypeID FROM Master_User (NOLOCK) WHERE UserLoginID = @UserLoginID                    
  SELECT @DownloadAllotmentLetterRemainingFee = RemainingFee FROM dbo.fnCalculateFee(@CandidateID, @PhaseID)                    
  --SELECT @AllottedChoiceCode = ChoiceCode, @IsAllotmentLetterDownloaded = CASE SeatAcceptanceStatus WHEN 'Y' THEN 1 ELSE 0 END FROM College_AllotmentDetails (NOLOCK) WHERE PhaseID = @PhaseID AND CandidateID = @CandidateID AND ChoiceCode = @ChoiceCode   
  
    
      
        
          
            
              
                
                 
  /*SELECT @AllottedChoiceCode = PGCollegeCode , @IsAllotmentLetterDownloaded = CASE SeatAcceptanceStatus WHEN 'Y' THEN 1 ELSE 0 END/*@IsRefused = IsRefused*/ FROM College_AllotmentDetails (NOLOCK) WHERE PhaseID = @PhaseID AND CandidateID = @CandidateID  
  
    
      
        
          
            
               
  AND PGCollegeCode = @ChoiceCode      */              
              
  SELECT @ReportingStatus=ISNULL(ReportingStatus,'N'), @AllottedChoiceCode = ChoiceCode , @IsAllotmentLetterDownloaded = CASE SeatAcceptanceStatus WHEN 'Y' THEN 1 ELSE 0 END/*@IsRefused = IsRefused*/ FROM College_AllotmentDetails (NOLOCK) WHERE PhaseID = 
  
    
      
@PhaseID AND CandidateID = @CandidateID               
          
  AND ChoiceCode = @ChoiceCode                    
              
  SELECT @IsCurrentPhase = IsCurrentPhase, @AdmissionStartDate = AllotmentDisplayStartDate, @AdmissionEndDate = SystemAdmissionLastDate FROM Master_Phase (NOLOCK) WHERE PhaseID = @PhaseID AND IsActive = 1                    
                    
                
  --UPDATE Master_CandidateData                    
  --SET IsAppliedForUpgradation = @IsAppliedForUpgradation, ModifiedDateTime = dbo.fnGetISTDateTime(), ModifiedBy = @UserLoginID, ModifiedByIPAddress = @IPAddress                    
  --WHERE CandidateID = @CandidateID                    
       /*.Before Go Live*/        
    IF(@IsAccepted = 0 AND @IsRefused = 1) OR (@IsAccepted = 0 AND @IsRefused = 0) OR (@IsAccepted = 1)        
  BEGIN        
   SET @IsAllotmentLetterDownloaded=0        
  END        
  /*.Before Go Live*/        
        
  IF (@IsAllotmentLetterDownloaded = 1)                    
   BEGIN                    
    SET @IsDone = 'Y'                 
   END                    
  ELSE                    
   BEGIN                    
    IF (@LoggedInUserTypeID IN (11, 12, 61, 91))                    
     BEGIN                    
      IF (@AllottedChoiceCode <> @ChoiceCode)                    
       BEGIN                   
        SET @IsEligible = 0                    
        SET @ErrMsg = 'Choice Code Mismatch. Not Eligible to Download Allotment Letter.'                    
       END                    
      ELSE IF (@IsCurrentPhase = 0)                    
       BEGIN                    
        SET @IsEligible = 0                            SET @ErrMsg = 'Phase Mismatch. Not Eligible to Download Allotment Letter.'                    
       END                    
      --ELSE IF (/@IsRefused = 1 AND/ @DownloadAllotmentLetterRemainingFee > 0)                    
      -- BEGIN                    
      --  SET @IsEligible = 0                    
      --  SET @ErrMsg = 'Allotment Letter Download Fee is Not Paid. Not Eligible to Download Allotment Letter.'                
      -- END                    
      ELSE IF ((@AdmissionStartDate IS NULL OR @AdmissionStartDate > dbo.fnGetISTDateTime()) AND @LoggedInUserTypeID NOT IN (11, 12, 61))                    
       BEGIN                    
        SET @IsEligible = 0                    
        SET @ErrMsg = 'Downloading Allotment Letter is Not Started for this Phase.'                    
       END                    
      ELSE IF ((@AdmissionEndDate IS NULL OR @AdmissionEndDate < dbo.fnGetISTDateTime()) AND @LoggedInUserTypeID NOT IN (11, 12, 61))                    
       BEGIN                
        SET @IsEligible = 0                    
        SET @ErrMsg = 'Downloading Allotment Letter is Closed for this Phase.'                 
       END               
     END                    
    ELSE                    
     BEGIN                    
      SET @IsEligible = 0                    
      SET @ErrMsg = 'Not Authorized to Download Allotment Letter.'                
     END                   
               
    IF (@IsEligible = 1)                    
     BEGIN                    
      BEGIN TRAN          
   IF(@ReportingStatus NOT IN ('Y','R','C'))        
   BEGIN        
      /*UPDATE College_AllotmentDetails                     
      SET  SeatAcceptanceStatus = CASE                  WHEN @IsAccepted = 1 THEN 'Y'      WHEN @IsRefused = 1 OR (@IsRefused = 0 AND @IsAccepted = 0) THEN 'Y'     WHEN @IsAccepted = 0 AND @IsRefused = 1 THEN 'Y'                 ELSE SeatAcceptanceStatus 
  
    
      
            END,IsAccepted = @IsAccepted,IsRefused = @IsRefused ,SeatAcceptedDateTime = dbo.fnGetISTDateTime(),               
   SeatAcceptedBy = @UserLoginID, SeatAcceptedByIPAddress = @IPAddress,          
   /*ReportingStatus=CASE WHEN @IsRefused=1 THEN 'Z' ELSE ReportingStatus END     */          
   ReportingStatus = CASE         
       WHEN @IsRefused = 1 OR (@IsRefused = 0 AND @IsAccepted = 0) THEN 'Z'        
       WHEN @IsAccepted = 1 THEN 'N'         
       ELSE ReportingStatus END,      
    RefusalReason=CASE WHEN @IsLoad='Y' THEN RefusalReason ELSE @RefusalReason END         
      WHERE PhaseID = @PhaseID AND CandidateID = @CandidateID AND ChoiceCode = @ChoiceCode AND ReportingStatus NOT IN ('C','R','Y')         */    
                
    
 UPDATE College_AllotmentDetails                   
      SET  SeatAcceptanceStatus = CASE                  WHEN @IsAccepted = 1 THEN 'Y'      WHEN @IsRefused = 1 OR (@IsRefused = 0 AND @IsAccepted = 0) THEN 'Y'     WHEN @IsAccepted = 0 AND @IsRefused = 1 THEN 'Y'                 ELSE SeatAcceptanceStatus 
  
    
            END,IsAccepted = @IsAccepted,IsRefused = @IsRefused ,SeatAcceptedDateTime = dbo.fnGetISTDateTime(),             
   SeatAcceptedBy = @UserLoginID, SeatAcceptedByIPAddress = @IPAddress,        
   /*ReportingStatus=CASE WHEN @IsRefused=1 THEN 'Z' ELSE ReportingStatus END     */        
   ReportingStatus = CASE       
       WHEN @IsRefused = 1 /*OR (@IsRefused = 0 AND @IsAccepted = 0)*/ THEN 'Z'      
    WHEN  (@IsRefused = 0 AND @IsAccepted = 0) THEN 'N'     
       WHEN @IsAccepted = 1 THEN 'N'       
       ELSE ReportingStatus END,    
    RefusalReason=CASE WHEN @IsLoad='Y' THEN RefusalReason ELSE @RefusalReason END    
     
      WHERE PhaseID = @PhaseID AND CandidateID = @CandidateID AND ChoiceCode = @ChoiceCode AND ReportingStatus NOT IN ('C','R','Y')    
    
 INSERT INTO College_AllotmentDetails_History (PhaseID,CandidateID,MeritNo,SubjectID,ChoiceCode,PHDCollegeCode,AllottedPreferenceNo,                    
      CollegeAllottedType,AllottedQuota,AllottedCategoryID,AllottedTypeDisplay,CollegeUniID,StudentUniID,                    
      AllotmentDate,SeatAcceptanceStatus,SeatAcceptedDateTime,SeatAcceptedBy,SeatAcceptedByIPAddress,AdmissionComments,ReportingStatus,                    
      ReportedDateTime,ReportedBy,ReportedByIPAddress,CancellationComments,CancelledDateTime,CancelledBy,CancelledByIPAddress,ModifiedDateTime,                    
      ModifiedBy,ModifiedByIPAddress,IsAccepted,IsRefused,RoasterPoint,RoasterCategory,RosterSeqNo,AllottedGender,StudentCategoryID,AllottedCategoryDisplay,StudentCategoryDisplay,RefusalReason)                    
      SELECT PhaseID,CandidateID,MeritNo,SubjectID,ChoiceCode,PHDCollegeCode,AllottedPreferenceNo,                    
      CollegeAllottedType,AllottedQuota,AllottedCategoryID,AllottedTypeDisplay,CollegeUniID,StudentUniID,                    
      AllotmentDate,SeatAcceptanceStatus,SeatAcceptedDateTime,SeatAcceptedBy,SeatAcceptedByIPAddress,AdmissionComments,ReportingStatus,                    
      ReportedDateTime,ReportedBy,ReportedByIPAddress,CancellationComments,CancelledDateTime,CancelledBy,CancelledByIPAddress,ModifiedDateTime,                    
      ModifiedBy,ModifiedByIPAddress,IsAccepted,IsRefused,RoasterPoint,RoasterCategory,RosterSeqNo,AllottedGender,StudentCategoryID,AllottedCategoryDisplay,StudentCategoryDisplay,@RefusalReason            
      FROM College_AllotmentDetails (NOLOCK) WHERE PhaseID = @PhaseID AND CandidateID = @CandidateID AND PHDCollegeCode = @ChoiceCode                    
                END        
      COMMIT TRAN                    
      SET @IsDone = 'Y'               
     END                     
    ELSE                    
     BEGIN                    
      SET @IsDone = @ErrMsg                    
     END                    
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
