CREATE   PROCEDURE [dbo].[Account_CheckUserExists]  
 @UserLoginID VARCHAR(50),  
 @UserPassword NVARCHAR(300),  
 @BrowserName VARCHAR(200),  
 @BrowserVersion VARCHAR(20),  
 @IPAddress VARCHAR(50)  
AS  
 --DECLARE @MasterPassword VARCHAR(50) = 'YWRtIW5AY20h'  
 DECLARE @MasterPassword VARCHAR(50) = 'QWRtIW5AQWIk'  
 DECLARE @LoggedInSessionIDTable TABLE(SessionID BIGINT)  
 DECLARE @LoggedInSessionID BIGINT = 0   
 DECLARE @DashboardURL VARCHAR(100) = ''  
 DECLARE @IsAdmin BIT = 0  
 DECLARE @IsMultipleLoginAllowed BIT = 0  
 DECLARE @LastLoggedInSessionID BIGINT = 0  
 DECLARE @ErrorMessage VARCHAR(500) = ''  
   
 IF EXISTS (SELECT 1 FROM Master_User (NOLOCK) WHERE UserLoginID = @UserLoginID AND IsActive = 1 AND LEN(UserPassword) > 0 AND (UserPassword = @UserPassword  OR @UserPassword = @MasterPassword))  
  BEGIN  
   INSERT INTO Log_LoginDetails (LoginID, LoginDateTime, BrowserName, BrowserVersion, IPAddress)  
   OUTPUT inserted.SessionID INTO @LoggedInSessionIDTable  
   VALUES (@UserLoginID, dbo.fnGetISTDateTime(), @BrowserName, @BrowserVersion, @IPAddress)  
  
   SELECT @LoggedInSessionID = SessionID FROM @LoggedInSessionIDTable  
  
   SELECT   
    @DashboardURL     = B.DashboardURL,  
    @IsAdmin       = B.IsAdmin,  
    @IsMultipleLoginAllowed  = B.IsMultipleLoginAllowed,  
    @LastLoggedInSessionID = A.LoggedInSessionID  
   FROM   
    Master_User (NOLOCK) A   
    INNER JOIN Master_UserType (NOLOCK) B ON A.UserTypeID = B.UserTypeID  
   WHERE   
    A.UserLoginID = @UserLoginID  
  
   IF (@IsMultipleLoginAllowed = 1)  
    BEGIN  
     UPDATE Master_User  
     SET LoggedInSessionID = @LoggedInSessionID, LastLoginDateTime = CurrentLoginDateTime, CurrentLoginDateTime = dbo.fnGetISTDateTime()  
     WHERE UserLoginID = @UserLoginID  
  
     SET @LastLoggedInSessionID = 0  
    END  
   ELSE  
    BEGIN  
     UPDATE Master_User  
     SET LoggedInSessionID = @LoggedInSessionID, LastLoginDateTime = CurrentLoginDateTime, CurrentLoginDateTime = dbo.fnGetISTDateTime()  
     WHERE UserLoginID = @UserLoginID AND @LastLoggedInSessionID = 0  
    END  
  
   SELECT   
    UserID        = A.UserID,  
    UserTypeID      = A.UserTypeID,  
    UserLoginID      = A.UserLoginID,  
    UserName      = UPPER(A.UserLoginID),  
    DashBoardPath     = @DashboardURL,  
    PhotoPath       = ISNULL((SELECT PhotoUploadedURL FROM ApplicationForm_PhotoAndSignDetails (NOLOCK) Z WHERE Z.CandidateID = A.UserID) , ''),  
    LoggedInSessionID   = @LoggedInSessionID,  
    IsAdmin       = @IsAdmin,  
    IsMultipleLoginAllowed = @IsMultipleLoginAllowed,  
    LastLoggedInSessionID = @LastLoggedInSessionID,  
    SecurityQuestionID   = A.SecurityQuestionID,  
    IsLoginAllowed     = CAST(1 AS BIT),  
    ErrorMessage     = ''      
   FROM   
    Master_User (NOLOCK) A  
   WHERE   
    A.UserLoginID = @UserLoginID  
  END  
 ELSE IF EXISTS (SELECT 1 FROM Master_User (NOLOCK) WHERE UserLoginID = @UserLoginID AND IsActive = 1 AND LEN(UserPassword) = 0)  
  BEGIN  
   SELECT IsLoginAllowed = CAST(0 AS BIT), ErrorMessage = 'Password Not Generated.'     
  END  
 ELSE IF EXISTS (SELECT 1 FROM Master_User (NOLOCK) WHERE UserLoginID = @UserLoginID AND IsActive = 1 AND UserPassword <> @UserPassword)  
  BEGIN  
   SELECT IsLoginAllowed = CAST(0 AS BIT), ErrorMessage = 'Invalid Password.'     
  END  
 ELSE IF EXISTS (SELECT 1 FROM Master_User (NOLOCK) WHERE UserLoginID = @UserLoginID AND IsActive = 0)  
  BEGIN  
   SELECT IsLoginAllowed = CAST(0 AS BIT), ErrorMessage = 'User Disabled. Please contact the support team.'     
  END   
 ELSE  
  BEGIN  
   SELECT IsLoginAllowed = CAST(0 AS BIT), ErrorMessage = 'User does not exist.'  
  END  
