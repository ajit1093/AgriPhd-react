CREATE   PROCEDURE [dbo].[ApplicationForm_RegisterCandidate]        
  --@AppliedCourseID INT,        
  @CandidateName VARCHAR(150),        
  @FatherName VARCHAR(150),        
  --@MotherName VARCHAR(150),        
  @GenderCode CHAR(1),        
  @DOB DATE,        
  @MobileNo VARCHAR(10),        
  @EMailID VARCHAR(100),        
  @SecurityQuestionID SMALLINT,        
  @SecurityQuestionAnswer VARCHAR(50),        
  @Password VARCHAR(250),        
  @UserLoginID VARCHAR(50),        
  @IPAddress VARCHAR(50),        
  @PageCode VARCHAR(50),      
  @ApplicationFormNo BIGINT      
AS        
 DECLARE @Candidate TABLE(CandidateID BIGINT)        
 DECLARE @CandidateID BIGINT = 0        
 --DECLARE @ApplicationID VARCHAR(10)        
 DECLARE @ProjectCode VARCHAR(4) = (SELECT ProjectCode FROM Master_Project (NOLOCK))        
 DECLARE @IsDone VARCHAR(500) = 'N'        
 DECLARE @IsInnerProcOk BIT = 0        
         
 BEGIN TRY        
  BEGIN TRAN        
      
  INSERT INTO ApplicationForm_RegistrationDetails (CandidateName, FatherName, GenderCode, DOB, MobileNo, EMailID, CreatedDateTime, CreatedBy, CreatedByIPAddress)        
  OUTPUT inserted.CandidateID INTO @Candidate        
  VALUES (@CandidateName, @FatherName, @GenderCode, @DOB, @MobileNo, @EMailID, dbo.fnGetISTDateTime(), @UserLoginID, @IPAddress)        
      
  SET @CandidateID = (SELECT CandidateID FROM @Candidate)        
  --SET @ApplicationID = @ProjectCode + CAST(@CandidateID AS VARCHAR)        
  --SET @UserLoginID = CASE WHEN LEN(@UserLoginID) > 0 THEN @UserLoginID ELSE @ApplicationID END        
      
      
  SET @UserLoginID = CASE WHEN LEN(@UserLoginID) > 0 THEN @UserLoginID ELSE @ApplicationFormNo END        
      
 -- UPDATE ApplicationForm_RegistrationDetails SET ApplicationID = @ApplicationID, CreatedBy = @UserLoginID WHERE CandidateID = @CandidateID       
  UPDATE ApplicationForm_RegistrationDetails SET ApplicationID = @ApplicationFormNo, CreatedBy = @UserLoginID WHERE CandidateID = @CandidateID       
          
  INSERT INTO ApplicationForm_Status (CandidateID)         
  VALUES (@CandidateID)        
        
  INSERT INTO Master_User (UserID, UserTypeID, UserLoginID, UserPassword, UserName, UserMobileNo, UserEmailID, SecurityQuestionID, SecurityQuestionAnswer, ModifiedDateTime, ModifiedBy, ModifiedByIPAddress)        
  VALUES (@CandidateID, 91, @ApplicationFormNo, @Password, @CandidateName, @MobileNo, @EMailID, @SecurityQuestionID, @SecurityQuestionAnswer, dbo.fnGetISTDateTime(), @ApplicationFormNo, @IPAddress)        
       
  IF EXISTS (SELECT 1 FROM Master_User (NOLOCK) WHERE UserLoginID = @ApplicationFormNo AND UserTypeID=91)        
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
      SET @IsDone = @ApplicationFormNo        
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
 END TRY        
 BEGIN CATCH        
  IF(@@TRANCOUNT > 0)        
   ROLLBACK TRAN        
        
  SET @IsDone = 'N'        
        
  INSERT INTO Log_ErrorDetails(LogSource, ErrorMessage, LogDate, UserLoginID)        
  VALUES(ERROR_PROCEDURE(), ERROR_MESSAGE(), dbo.fnGetISTDateTime(), @CandidateName)         
 END CATCH        
        
 SELECT  @IsDone AS IsOk 
