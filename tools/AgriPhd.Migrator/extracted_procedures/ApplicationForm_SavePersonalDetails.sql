CREATE PROCEDURE [dbo].[ApplicationForm_SavePersonalDetails]        
 @CandidateID BIGINT,        
 @AppliedCourseID INT,        
 @CandidateName VARCHAR(150),         
 @FatherName VARCHAR(150),         
 @GenderCode CHAR(1),         
 @DOB DATE,         
 @MobileNo VARCHAR(10),         
 @EMailID VARCHAR(100),       
 @SaluationID   SMALLINT,      
 @FathersOccupation VARCHAR(50),      
 @MotherMaidanName VARCHAR(100),      
 @MotherPresentName VARCHAR(100),      
 @AlternateMobile  VARCHAR(10),
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
        
    UPDATE ApplicationForm_RegistrationDetails         
    SET CandidateName = @CandidateName, FatherName = @FatherName,  GenderCode = @GenderCode, DOB = @DOB, MobileNo = @MobileNo, EMailID = @EMailID,       
   SaluationID=@SaluationID,      
   FathersOccupation=@FathersOccupation,      
   MotherMaidanName=@MotherMaidanName,      
   MotherPresentName=@MotherPresentName,
   MobileNo1=@AlternateMobile,
   ModifiedDateTime = dbo.fnGetISTDateTime(), ModifiedBy = @UserLoginID,       
   ModifiedByIPAddress = @IPAddress          
    WHERE CandidateID = @CandidateID        
        
    UPDATE Master_User        
    SET UserName = @CandidateName, UserMobileNo = @MobileNo, UserEmailID = @EMailID, ModifiedDateTime = dbo.fnGetISTDateTime(), ModifiedBy = @UserLoginID, ModifiedByIPAddress = @IPAddress          
    WHERE UserID = @CandidateID        
        
    IF EXISTS (SELECT 1 FROM ApplicationForm_RegistrationDetails (NOLOCK) WHERE CandidateID = @CandidateID)        
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
        
 SELECT  @IsDone AS IsOk 
