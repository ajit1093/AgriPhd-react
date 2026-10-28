
CREATE     PROCEDURE [dbo].[College_SaveCollegeDetails]
	@CollegeID BIGINT,
	@CollegeCode VARCHAR(5), 
	@CollegeName VARCHAR(250), 
	@CollegeAddress VARCHAR(250), 
	@DistrictID INT, 
	@Taluka  VARCHAR(50), 
	@City  VARCHAR(50), 
	@Pincode VARCHAR(6), 
	@MobileNo VARCHAR(10), 
	@EMailID VARCHAR(100), 
	@CourseID SMALLINT, 
	@CourseStatusID SMALLINT, 
	@Intake SMALLINT, 
	@HasManagementQuota BIT,
	@PrincipalName VARCHAR(150), 
	@PrincipalEMailID VARCHAR(100), 
	@PrincipalMobileNo VARCHAR(10), 
    @AdmissionInchargeName VARCHAR(150), 
	@AdmissionInchargeEMailID VARCHAR(100), 
	@AdmissionInchargeMobileNo VARCHAR(10),
	@UserLoginID VARCHAR(50),
	@IPAddress VARCHAR(50)
AS
	DECLARE @IsDone	VARCHAR(500) = 'N'  

	BEGIN TRY
		BEGIN TRAN  

		IF (@CollegeID > 0)
			BEGIN
				UPDATE Master_CollegeDetails
				SET CollegeName = @CollegeName, CollegeAddress = @CollegeAddress, DistrictID = @DistrictID, Taluka = @Taluka, City = @City, Pincode = @Pincode, MobileNo = @MobileNo, EMailID = @EMailID, CourseID = @CourseID, CourseStatusID = @CourseStatusID, Intake = @Intake, HasManagementQuota = @HasManagementQuota, PrincipalName = @PrincipalName, PrincipalEMailID = @PrincipalEMailID, PrincipalMobileNo = @PrincipalMobileNo, AdmissionInchargeName = @AdmissionInchargeName, AdmissionInchargeEMailID = @AdmissionInchargeEMailID, AdmissionInchargeMobileNo = @AdmissionInchargeMobileNo, ModifiedDateTime = dbo.fnGetISTDateTime(), ModifiedBy = @UserLoginID, ModifiedByIPAddress = @IPAddress
				WHERE CollegeID = @CollegeID

				UPDATE Master_User
				SET UserName = @AdmissionInchargeName, UserMobileNo = @AdmissionInchargeMobileNo, UserEMailID = @AdmissionInchargeEMailID, ModifiedDateTime = dbo.fnGetISTDateTime(), ModifiedBy = @UserLoginID, ModifiedByIPAddress = @IPAddress
				WHERE UserID = @CollegeID
			END
		ELSE
			BEGIN
				SET @CollegeID = @CollegeCode

				INSERT INTO Master_CollegeDetails (CollegeID, CollegeCode, CollegeName, CollegeAddress, DistrictID, Taluka, City, Pincode, MobileNo, EMailID, CourseID, CourseStatusID, Intake, HasManagementQuota, PrincipalName, PrincipalEMailID, PrincipalMobileNo, AdmissionInchargeName, AdmissionInchargeEMailID, AdmissionInchargeMobileNo, IsActive, ModifiedDateTime, ModifiedBy, ModifiedByIPAddress)
				VALUES (@CollegeID, @CollegeCode, @CollegeName, @CollegeAddress, @DistrictID, @Taluka, @City, @Pincode, @MobileNo, @EMailID, @CourseID, @CourseStatusID, @Intake, @HasManagementQuota, @PrincipalName, @PrincipalEMailID, @PrincipalMobileNo, @AdmissionInchargeName, @AdmissionInchargeEMailID, @AdmissionInchargeMobileNo, 1, dbo.fnGetISTDateTime(), @UserLoginID, @IPAddress)           

				INSERT INTO Master_User (UserID, UserTypeID, UserLoginID, UserPassword, UserName, UserMobileNo, UserEMailID, IsActive, ModifiedDateTime, ModifiedBy, ModifiedByIPAddress)
				VALUES (@CollegeID, 61, @CollegeCode, '', @AdmissionInchargeName, @AdmissionInchargeMobileNo, @AdmissionInchargeEMailID, 1, dbo.fnGetISTDateTime(), @UserLoginID, @IPAddress)
			END
		
		INSERT INTO Master_CollegeDetails_History (CollegeID, CollegeCode, CollegeName, CollegeAddress, DistrictID, Taluka, City, Pincode, MobileNo, EMailID, CourseID, CourseStatusID, Intake, HasManagementQuota, PrincipalName, PrincipalEMailID, PrincipalMobileNo, AdmissionInchargeName, AdmissionInchargeEMailID, AdmissionInchargeMobileNo, IsActive, ModifiedDateTime, ModifiedBy, ModifiedByIPAddress)
		SELECT CollegeID, CollegeCode, CollegeName, CollegeAddress, DistrictID, Taluka, City, Pincode, MobileNo, EMailID, CourseID, CourseStatusID, Intake, HasManagementQuota, PrincipalName, PrincipalEMailID, PrincipalMobileNo, AdmissionInchargeName, AdmissionInchargeEMailID, AdmissionInchargeMobileNo, IsActive, dbo.fnGetISTDateTime(), @UserLoginID, @IPAddress FROM Master_CollegeDetails (NOLOCK) WHERE CollegeID = @CollegeID           

		INSERT INTO Master_User_History (UserID, UserTypeID, UserLoginID, UserPassword, UserName, UserMobileNo, UserEMailID, CurrentLoginDateTime, LastLoginDateTime, IsActive, ModifiedDateTime, ModifiedBy, ModifiedByIPAddress)
		SELECT UserID, UserTypeID, UserLoginID, UserPassword, UserName, UserMobileNo, UserEMailID, CurrentLoginDateTime, LastLoginDateTime, IsActive, dbo.fnGetISTDateTime(), @UserLoginID, @IPAddress FROM Master_user (NOLOCK) WHERE UserID = @CollegeID
		
		COMMIT TRAN
		SET @IsDone = @CollegeID
	END TRY
	BEGIN CATCH  
		IF(@@TRANCOUNT > 0)  
			ROLLBACK TRAN  
     
		SET @IsDone = 'N'  
     
		INSERT INTO Log_ErrorDetails(LogSource, ErrorMessage, LogDate, UserLoginID)  
		VALUES(ERROR_PROCEDURE(), ERROR_MESSAGE() + ' AT ' + CAST(ERROR_LINE() AS VARCHAR(10)) + ' For College ID '  + CAST(@CollegeID AS VARCHAR(20)) , dbo.fnGetISTDateTime(), @UserLoginID)   
	END CATCH  
   
	SELECT @IsDone AS IsOk

