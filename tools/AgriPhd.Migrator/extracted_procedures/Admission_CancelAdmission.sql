CREATE  PROCEDURE [dbo].[Admission_CancelAdmission]            
 @CandidateID BIGINT,            
 @ChoiceCode BIGINT,            
 @PhaseID SMALLINT,            
 @CancellationComments VARCHAR(250),            
 @CancelledBy VARCHAR(50),            
 @CancelledByIPAddress VARCHAR(50)            
AS            
 DECLARE @IsEligible SMALLINT = 1            
 DECLARE @ErrMsg VARCHAR(250) = ''            
 DECLARE @IsDone VARCHAR(500) = 'N'            
             
 BEGIN TRY               
  BEGIN TRAN            
            
  SELECT @IsEligible = IsEligible, @ErrMsg = ErrMsg FROM dbo.fnCheckAdmissionCancelEligiblity(@CandidateID, @ChoiceCode, @PhaseID, @CancelledBy)             
              
  IF (@IsEligible = 1)            
   BEGIN            
    UPDATE College_AllotmentDetails            
    SET ReportingStatus = 'C', CancellationComments = @CancellationComments, CancelledDateTime = dbo.fnGetISTDateTime(), CancelledBy = @CancelledBy, CancelledByIPAddress = @CancelledByIPAddress, ModifiedDateTime = dbo.fnGetISTDateTime(),           
 ModifiedBy = @CancelledBy, ModifiedByIPAddress = @CancelledByIPAddress            
    WHERE PhaseID = @PhaseID AND CandidateID = @CandidateID AND PHDCollegeCode = @ChoiceCode AND ReportingStatus = 'Y'            
                
            
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
  VALUES(ERROR_PROCEDURE(), ERROR_MESSAGE() + ' AT ' + CAST(ERROR_LINE() AS VARCHAR(10)) + ' For Form No '  + CAST(@CandidateID AS VARCHAR(20)), dbo.fnGetISTDateTime(), @CancelledBy)             
 END CATCH            
            
 SELECT @IsDone AS IsOk     
