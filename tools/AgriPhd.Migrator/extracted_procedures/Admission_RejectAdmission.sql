CREATE PROCEDURE [dbo].[Admission_RejectAdmission]                  
@CandidateID BIGINT,                  
@ChoiceCode BIGINT,                  
@PhaseID SMALLINT,                  
@RejectionComments VARCHAR(250),                  
@RejectedBy VARCHAR(50),                  
@RejectedByIPAddress VARCHAR(50)                  
AS              
BEGIN              
DECLARE @IsEligible SMALLINT = 1                  
DECLARE @ErrMsg VARCHAR(250) = ''                  
DECLARE @IsDone VARCHAR(500) = 'N'                  
BEGIN TRY                     
  BEGIN TRAN                  
  SELECT @IsEligible = IsEligible, @ErrMsg = ErrMsg FROM dbo.fnCheckAdmissionRejectEligiblity(@CandidateID, @ChoiceCode, @PhaseID, @RejectedBy)                   
  IF (@IsEligible = 1)                  
   BEGIN                  
    UPDATE College_AllotmentDetails                  
    SET AdmissionComments = @RejectionComments, ReportingStatus = 'R', ReportedDateTime = dbo.fnGetISTDateTime(), ReportedBy = @RejectedBy, ReportedByIPAddress = @RejectedByIPAddress, ModifiedDateTime = dbo.fnGetISTDateTime(), ModifiedBy = @RejectedBy,   
  
    
      
        
              
 ModifiedByIPAddress = @RejectedByIPAddress WHERE PhaseID = @PhaseID AND CandidateID = @CandidateID AND PHDCollegeCode = @ChoiceCode AND ReportingStatus = 'N'               
            
/*    INSERT INTO College_AllotmentDetails_History (PhaseID,CandidateID,MeritNo,ChoiceCode,PGCollegeCode,AllottedPreferenceNo,             CollegeAllottedType,SubjectAllottedType,AllottedQuota,AllottedCategoryID,AllottedTypeDisplay,CollegeUniID,StudentUni
  
    
      
ID        
,RosterID,             AllotmentDate,SeatAcceptanceStatus,SeatAcceptedDateTime,SeatAcceptedBy,SeatAcceptedByIPAddress,AdmissionComments,ReportingStatus,             ReportedDateTime,ReportedBy,ReportedByIPAddress,CancellationComments,CancelledDateTime,   
  
    
     
CancelledBy,CancelledByIPAddress,ModifiedDateTime,             ModifiedBy,ModifiedByIPAddress,IsAccepted,IsRefused,RoasterPoint,RoasterCategory,RoasterSeqNo,AllotedGender)             SELECT PhaseID,CandidateID,MeritNo,ChoiceCode,PGCollegeCode,AllottedPre
  
    
      
fer        
enceNo,             CollegeAllottedType,SubjectAllottedType,AllottedQuota,AllottedCategoryID,AllottedTypeDisplay,CollegeUniID,StudentUniID,RosterID,             AllotmentDate,SeatAcceptanceStatus,SeatAcceptedDateTime,SeatAcceptedBy,SeatAcceptedByIPAddress
  
    
      
        
,AdmissionComments,ReportingStatus,             ReportedDateTime,ReportedBy,ReportedByIPAddress,CancellationComments,CancelledDateTime,CancelledBy,CancelledByIPAddress,ModifiedDateTime,             ModifiedBy,ModifiedByIPAddress,IsAccepted,IsRefused,Roast
  
    
      
        
erPoint,RoasterCategory,RoasterSeqNo,AllotedGender               
FROM College_AllotmentDetails (NOLOCK) WHERE PhaseID = @PhaseID AND CandidateID = @CandidateID AND PGCollegeCode = @ChoiceCode     */        
        
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
  VALUES(ERROR_PROCEDURE(), ERROR_MESSAGE() + ' AT ' + CAST(ERROR_LINE() AS VARCHAR(10)) + ' For Form No '  + CAST(@CandidateID AS VARCHAR(20)), dbo.fnGetISTDateTime(), @RejectedBy)                   
END CATCH                  
SELECT @IsDone AS IsOk              
END     
