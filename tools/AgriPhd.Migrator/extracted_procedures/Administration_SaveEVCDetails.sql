

CREATE     PROCEDURE [dbo].[Administration_SaveEVCDetails]
	@EVCID BIGINT,
	@CoordinatorName VARCHAR(250), 
	@CoordinatorMobileNo VARCHAR(10), 
	@CoordinatorEMailID VARCHAR(100), 
	@Password VARCHAR(250),
	@UserTypeID INT,
	@UserLoginID VARCHAR(50),
	@IPAddress VARCHAR(50)
AS
	DECLARE @EVCCode VARCHAR(50) = ''
	DECLARE @IsDone VARCHAR(500) = 'N'

	BEGIN TRY
		BEGIN TRAN

		IF (@EVCID > 0)
			BEGIN
				UPDATE Master_EVC
				SET CoordinatorName = @CoordinatorName, CoordinatorMobileNo = @CoordinatorMobileNo, CoordinatorEMailID = @CoordinatorEMailID, ModifiedDateTime = [dbo].[fnGetISTDateTime](), ModifiedBy = @UserLoginID, ModifiedByIPAddress = @IPAddress
				WHERE EVCID = @EVCID

				UPDATE Master_EVC
				SET CoordinatorName = @CoordinatorName, CoordinatorMobileNo = @CoordinatorMobileNo, CoordinatorEMailID = @CoordinatorEMailID, ModifiedDateTime = [dbo].[fnGetISTDateTime](), ModifiedBy = @UserLoginID, ModifiedByIPAddress = @IPAddress
				WHERE ParentEVCID = @EVCID

				UPDATE Master_User
				SET UserName = @CoordinatorName, UserMobileNo = @CoordinatorMobileNo, UserEmailID = @CoordinatorEMailID, ModifiedDateTime = [dbo].[fnGetISTDateTime](), ModifiedBy = @UserLoginID, ModifiedByIPAddress = @IPAddress
				WHERE UserID = @EVCID
			END
		ELSE
			BEGIN
				SELECT @EVCID = ISNULL(MAX(UserID), 10000) + 1 FROM Master_User (NOLOCK) WHERE UserTypeID IN (41, 42)
				SELECT @EVCCode = 'EVC' + CAST(@EVCID AS VARCHAR)

				INSERT INTO Master_EVC (EVCID, ParentEVCID, EVCCode, CoordinatorName, CoordinatorMobileNo, CoordinatorEMailID, IsActive, CreatedDateTime, CreatedBy, CreatedByIPAddress, ModifiedDateTime, ModifiedBy, ModifiedByIPAddress)
				VALUES (@EVCID, 0, @EVCCode, @CoordinatorName, @CoordinatorMobileNo, @CoordinatorEMailID, 1, [dbo].[fnGetISTDateTime](), @UserLoginID, @IPAddress, [dbo].[fnGetISTDateTime](), @UserLoginID, @IPAddress)    
			
				INSERT INTO Master_User (UserID, UserTypeID, UserLoginID, UserPassword, UserName, UserMobileNo, UserEmailID, ModifiedBy, ModifiedByIPAddress)
				VALUES (@EVCID, @UserTypeID, @EVCCode, @Password, @CoordinatorName, @CoordinatorMobileNo, @CoordinatorEMailID, @UserLoginID, @IPAddress)        
			END

		INSERT INTO Master_EVC_History (EVCID, ParentEVCID, EVCCode, CoordinatorName, CoordinatorMobileNo, CoordinatorEMailID, IsActive, ModifiedDateTime, ModifiedBy, ModifiedByIPAddress)
		SELECT EVCID, ParentEVCID, EVCCode, CoordinatorName, CoordinatorMobileNo, CoordinatorEMailID, IsActive, [dbo].[fnGetISTDateTime](), @UserLoginID, @IPAddress FROM Master_EVC (NOLOCK) WHERE EVCID = @EVCID

		INSERT INTO Master_EVC_History (EVCID, ParentEVCID, EVCCode, CoordinatorName, CoordinatorMobileNo, CoordinatorEMailID, IsActive, ModifiedDateTime, ModifiedBy, ModifiedByIPAddress)
		SELECT EVCID, ParentEVCID, EVCCode, CoordinatorName, CoordinatorMobileNo, CoordinatorEMailID, IsActive, [dbo].[fnGetISTDateTime](), @UserLoginID, @IPAddress FROM Master_EVC (NOLOCK) WHERE ParentEVCID = @EVCID

		INSERT INTO Master_User_History (UserID, UserTypeID, UserLoginID, UserPassword, UserName, UserMobileNo, UserEmailID, CurrentLoginDateTime, LastLoginDateTime, IsActive, ModifiedDateTime, ModifiedBy, ModifiedByIPAddress)
		SELECT UserID, UserTypeID, UserLoginID, UserPassword, UserName, UserMobileNo, UserEmailID, CurrentLoginDateTime, LastLoginDateTime, IsActive, [dbo].[fnGetISTDateTime](), @UserLoginID, @IPAddress FROM Master_User (NOLOCK) WHERE UserID = @EVCID

		IF EXISTS (SELECT 1 FROM Master_EVC (NOLOCK) WHERE EVCID = @EVCID AND EVCID > 0) AND EXISTS (SELECT 1 FROM Master_User (NOLOCK) WHERE UserID = @EVCID)
			BEGIN
				COMMIT TRAN
				SET @IsDone = 'Y'
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
		VALUES(ERROR_PROCEDURE(), ERROR_MESSAGE() + ' AT ' + CAST(ERROR_LINE() AS VARCHAR(10)) + ' For EVC '  + CAST(@EVCID AS VARCHAR(20)) , [dbo].[fnGetISTDateTime](), @EVCID) 
	END CATCH

	SELECT  @IsDone AS IsOk

