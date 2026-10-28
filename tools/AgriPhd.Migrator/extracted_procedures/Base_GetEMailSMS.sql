  
CREATE PROCEDURE [dbo].[Base_GetEMailSMS]          
 @Purpose VARCHAR(100),          
 @MessageType CHAR(1),          
 @Param1 VARCHAR(50) = '',          
 @Param2 VARCHAR(50) = '',          
 @Param3 VARCHAR(50) = '',          
 @Param4 VARCHAR(50) = '',          
 @Param5 VARCHAR(50) = ''          
AS          
 DECLARE @MobileNo VARCHAR(10) = ''          
 DECLARE @EMailID VARCHAR(100) = ''          
 DECLARE @TemplateID VARCHAR(50) = ''          
 DECLARE @Subject NVARCHAR(500) = ''          
 DECLARE @Message NVARCHAR(MAX) = ''          
 DECLARE @VAR1 VARCHAR(100) = ''          
 DECLARE @VAR2 VARCHAR(100) = ''          
 DECLARE @VAR3 VARCHAR(100) = ''          
 DECLARE @VAR4 VARCHAR(100) = ''          
 DECLARE @VAR5 VARCHAR(100) = ''          
           
 IF (@MessageType = 'S')          
  BEGIN          
   IF (@Purpose = 'NewCandidateRegistration')          
    BEGIN          
     SELECT          
      @MobileNo = UserMobileNo,          
      --@TemplateID = '667c0d75d6fc0535cd4af4a2',          
      --@TemplateID = '66e6ef89d6fc0562ec074e73',   
		@TemplateID = '6741bd9bd6fc0517061100e2',  
	--@TemplateID =1234,
      @VAR1  = UserLoginID          
     FROM          
      Master_User (NOLOCK)          
     WHERE          
      UserLoginID = @Param1          
    END          
   ELSE IF (@Purpose = 'ResetPassword')          
    BEGIN          
     SELECT          
      --@TemplateID = '667c0d15d6fc052f4966e732'          
   --@TemplateID = '66e6e48dd6fc05741e6aa682'     
  @TemplateID = '6741bc3ed6fc05167e18cc32' 
  --@TemplateID =1234
    END          
   ELSE IF (@Purpose = 'FullyVerified')          
    BEGIN          
     SELECT          
      @MobileNo = UserMobileNo,          
      --@TemplateID = '667c0da1d6fc0529a87b4c62',          
   --@TemplateID = '66e6e20dd6fc053e3a427703',  
   @TemplateID = '6741b604d6fc0506243ad882',
   --@TemplateID =1234,
      @VAR1  = UserLoginID          
     FROM          
      Master_User (NOLOCK)          
     WHERE          
      UserID = @Param1          
    END          
   ELSE IF (@Purpose = 'PartiallyVerified')          
    BEGIN          
     SELECT          
      @MobileNo = UserMobileNo,          
      --@TemplateID = '667c0dc8d6fc056b8b3fd372',          
   --@TemplateID = '66e6e392d6fc053860341412',   
  @TemplateID = '6741b655d6fc056c0f731592', 
 -- @TemplateID =1234,
      @VAR1  = UserLoginID          
     FROM          
      Master_User (NOLOCK)          
     WHERE          
      UserID = @Param1          
    END        
 ELSE IF (@Purpose = 'VerifyMobileNo')          
    BEGIN      
     SELECT          
      @MobileNo = @Param1,          
      --@TemplateID = 'NOTFINALIZED',         
   --@TemplateID='66e6e583d6fc0517bd079f22',  
   @TemplateID = '6741bc92d6fc05518a523a63', 
  --@TemplateID =1234,
      @VAR1  = 'RegistrationPage'          
    END          
  END          
 ELSE IF (@MessageType = 'E')          
  BEGIN          
   IF (@Purpose = 'NewCandidateRegistration')          
    BEGIN          
     SELECT           
      @EMailID  = UserEmailID,          
      @Subject  = 'Application Login Details - MCAER, Pune',          
      @Message = 'Dear <b>' + UserName + '</b>,<br /><br />'          
           + 'You have completed the basic registration process.<br />'          
           + 'Please find below your username and password for logging into the online application and complete your registration.<br /><br />'          
           + 'Your Login ID : <b>' + UserLoginID + '</b><br />'          
           + 'Your Password : <b>##Password##</b><br /><br />'          
           + '<b>This is an auto generated email. Please do not reply to this email.</b><br /><br /><br />'          
           + 'Thanks and Regards,<br />'          
           + '<b> MCAER, Pune</b>'          
     FROM          
      Master_User (NOLOCK)          
     WHERE          
      UserLoginID = @Param1          
    END          
   ELSE IF (@Purpose = 'ResetPassword')          
    BEGIN          
     SELECT           
      @Subject = 'OTP for Reset Password - MCAER, Pune',          
      @Message = 'Dear Candidate,<br /><br />'          
                                    + '<font size="3"><b>##OTP##</b></font> is your One Time Password (OTP) to Validate Your E-Mail ID.<br /><br />'          
                                    + '<b>This is an auto generated email. Please do not reply to this email.</b><br /><br /><br />'          
         + 'Thanks and Regards,<br />'          
                                    + '<b>MCAER, Pune</b>'          
    END          
   ELSE IF (@Purpose = 'FullyVerified')          
    BEGIN          
     SELECT           
      @EMailID  = UserEmailID,          
      @Subject  = 'Documents e-Verification - MCAER, Pune',          
      @Message = 'Dear <b>' + UserName + '</b>,<br /><br />'          
           + 'Your Documents has been e-Verified Successfully.<br /><br />'          
           + '<b>This is an auto generated email. Please do not reply to this email.</b><br /><br /><br />'          
           + 'Thanks and Regards,<br />'          
           + '<b> MCAER, Pune</b>'          
     FROM          
      Master_User (NOLOCK)          
     WHERE          
      UserID = @Param1          
    END          
   ELSE IF (@Purpose = 'PartiallyVerified')          
    BEGIN          
     SELECT           
      @EMailID  = UserEmailID,          
      @Subject  = 'Documents e-Verification - MCAER, Pune',          
      @Message = 'Dear <b>' + UserName + '</b>,<br /><br />'          
           + 'Your Required Documents has some Discrepancy. Please Check Document Status in Your Login.<br /><br />'          
           + '<b>This is an auto generated email. Please do not reply to this email.</b><br /><br /><br />'          
           + 'Thanks and Regards,<br />'          
           + '<b> MCAER, Pune</b>'          
     FROM          
      Master_User (NOLOCK)          
     WHERE          
      UserID = @Param1          
    END          
  END          
          
 SELECT           
  Purpose  = @Purpose,          
  MobileNo = @MobileNo,          
  EMailID  = @EMailID,          
  TemplateID = @TemplateID,          
  [Subject] = @Subject,          
  [Message] = @Message,          
  [VAR1]  = @VAR1,          
  [VAR2]  = @VAR2,          
  [VAR3]  = @VAR3,          
  [VAR4]  = @VAR4,          
  [VAR5]  = @VAR5 
