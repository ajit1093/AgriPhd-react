CREATE PROCEDURE [dbo].[Admission_ConfirmAdmission]                
 @CandidateID BIGINT,                
 @ChoiceCode BIGINT,                
 @PhaseID SMALLINT,                
 @AdmissionComments VARCHAR(250),                
 @ReportedBy VARCHAR(50),                
 @ReportedByIPAddress VARCHAR(50)                
AS                
 DECLARE @IsEligible SMALLINT = 1                
 DECLARE @ErrMsg VARCHAR(250) = ''                
 DECLARE @IsDone VARCHAR(500) = 'N'                
                
 BEGIN TRY                   
  BEGIN TRAN                
                
  SELECT @IsEligible = IsEligible, @ErrMsg = ErrMsg FROM dbo.fnCheckAdmissionConfirmEligiblity(@CandidateID, @ChoiceCode, @PhaseID, @ReportedBy)                 
                  
  IF (@IsEligible = 1)                
   BEGIN                    
    UPDATE College_AllotmentDetails                
    SET AdmissionComments = @AdmissionComments, ReportingStatus = 'Y', ReportedDateTime = dbo.fnGetISTDateTime(), ReportedBy = @ReportedBy, ReportedByIPAddress = @ReportedByIPAddress, ModifiedDateTime = dbo.fnGetISTDateTime(), ModifiedBy = @ReportedBy,   
  
    
      
        
            
 ModifiedByIPAddress = @ReportedByIPAddress                
    WHERE PhaseID = @PhaseID AND CandidateID = @CandidateID AND /*ChoiceCode*/ PHDCollegeCode = @ChoiceCode AND ReportingStatus = 'N'                
                     
    /*INSERT INTO College_AllotmentDetails_History (PhaseID,CandidateID,MeritNo,ChoiceCode,PGCollegeCode,AllottedPreferenceNo,             CollegeAllottedType,SubjectAllottedType,AllottedQuota,AllottedCategoryID,AllottedTypeDisplay,CollegeUniID,StudentUni
  
    
      
ID        
 ,RosterID,             AllotmentDate,SeatAcceptanceStatus,SeatAcceptedDateTime,SeatAcceptedBy,SeatAcceptedByIPAddress,AdmissionComments,ReportingStatus,             ReportedDateTime,ReportedBy,ReportedByIPAddress,CancellationComments,CancelledDateTime,Ca
  
    
      
n        
  celledBy,CancelledByIPAddress,ModifiedDateTime,             ModifiedBy,ModifiedByIPAddress,IsAccepted,IsRefused,RoasterPoint,RoasterCategory,RoasterSeqNo,AllotedGender)             SELECT PhaseID,CandidateID,MeritNo,ChoiceCode,PGCollegeCode,AllottedPref
  
    
      
er        
  enceNo,             CollegeAllottedType,SubjectAllottedType,AllottedQuota,AllottedCategoryID,AllottedTypeDisplay,CollegeUniID,StudentUniID,RosterID,             AllotmentDate,SeatAcceptanceStatus,SeatAcceptedDateTime,SeatAcceptedBy,SeatAcceptedByIPAddre
  
    
      
ss        
  ,AdmissionComments,ReportingStatus,             ReportedDateTime,ReportedBy,ReportedByIPAddress,CancellationComments,CancelledDateTime,CancelledBy,CancelledByIPAddress,ModifiedDateTime,             ModifiedBy,ModifiedByIPAddress,IsAccepted,IsRefused,Roa
  
    
      
st        
  erPoint,RoasterCategory,RoasterSeqNo,AllotedGender       FROM College_AllotmentDetails (NOLOCK) WHERE PhaseID = @PhaseID AND CandidateID = @CandidateID AND PGCollegeCode = @ChoiceCode     */        
              
 INSERT INTO College_AllotmentDetails_History (PhaseID,CandidateID,MeritNo,SubjectID,ChoiceCode,PHDCollegeCode,AllottedPreferenceNo,                
      CollegeAllottedType,AllottedQuota,AllottedCategoryID,AllottedTypeDisplay,CollegeUniID,StudentUniID,                
      AllotmentDate,SeatAcceptanceStatus,SeatAcceptedDateTime,SeatAcceptedBy,SeatAcceptedByIPAddress,AdmissionComments,ReportingStatus,                
      ReportedDateTime,ReportedBy,ReportedByIPAddress,CancellationComments,CancelledDateTime,CancelledBy,CancelledByIPAddress,ModifiedDateTime,                
      ModifiedBy,ModifiedByIPAddress,IsAccepted,IsRefused,RoasterPoint,RoasterCategory,RosterSeqNo,AllottedGender,StudentCategoryID,AllottedCategoryDisplay,StudentCategoryDisplay,RefusalReason)                
      SELECT PhaseID,CandidateID,MeritNo,SubjectID,ChoiceCode,PHDCollegeCode,AllottedPreferenceNo,                
      CollegeAllottedType,AllottedQuota,AllottedCategoryID,AllottedTypeDisplay,CollegeUniID,StudentUniID,                
      AllotmentDate,SeatAcceptanceStatus,SeatAcceptedDateTime,SeatAcceptedBy,SeatAcceptedByIPAddress,AdmissionComments,ReportingStatus,                
      ReportedDateTime,ReportedBy,ReportedByIPAddress,CancellationComments,CancelledDateTime,CancelledBy,CancelledByIPAddress,ModifiedDateTime,                
      ModifiedBy,ModifiedByIPAddress,IsAccepted,IsRefused,RoasterPoint,RoasterCategory,RosterSeqNo,AllottedGender,StudentCategoryID,AllottedCategoryDisplay,StudentCategoryDisplay,RefusalReason          
      FROM College_AllotmentDetails (NOLOCK) WHERE PhaseID = @PhaseID AND CandidateID = @CandidateID AND PHDCollegeCode = @ChoiceCode             
                     
    COMMIT TRAN                
    SET @IsDone = 'Y'                
   END                
  ELSE                
   BEGIN                
    ROLLBACK TRAN                
    SET @IsDone = @ErrMsg                
   END                
 END TRY                
 BEGIN CATCH                  
  IF(@@TRANCOUNT > 0)                
   ROLLBACK TRAN                
                     
  SET @IsDone = 'N'                
                      
  INSERT INTO Log_ErrorDetails(LogSource, ErrorMessage, LogDate, UserLoginID)                
  VALUES(ERROR_PROCEDURE(), ERROR_MESSAGE() + ' AT ' + CAST(ERROR_LINE() AS VARCHAR(10)) + ' For Form No '  + CAST(@CandidateID AS VARCHAR(20)), dbo.fnGetISTDateTime(), @ReportedBy)                 
 END CATCH                
                
 SELECT @IsDone AS IsOk     
