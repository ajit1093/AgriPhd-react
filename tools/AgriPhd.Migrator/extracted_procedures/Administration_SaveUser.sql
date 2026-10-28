CREATE   PROCEDURE [dbo].[Administration_SaveUser]
	@UserID BIGINT,
	@UserTypeID INT,
	@UserPassword VARCHAR(250),
	@UserName VARCHAR(150),
	@UserMobileNo VARCHAR(10),
	@UserEMailID VARCHAR(100),
	@DistrictID INT,
	@RegionID SMALLINT,
	@ModifiedBy VARCHAR(50),
	@ModifiedByIPAddress VARCHAR(50)
AS
	DECLARE @UserLoginID VARCHAR(50) = ''
	DECLARE @IsDone	VARCHAR(500) = 'N'

	BEGIN TRY
		BEGIN TRAN

		IF (@UserID > 0)
			BEGIN
				UPDATE Master_User
				SET UserName = @UserName, UserMobileNo = @UserMobileNo, UserEmailID = @UserEMailID, ModifiedDateTime = dbo.fnGetISTDateTime(), ModifiedBy = @ModifiedBy, ModifiedByIPAddress = @ModifiedByIPAddress
				WHERE UserID = @UserID
			END
		ELSE
			BEGIN
				IF (@UserTypeID IN (21, 22))
					BEGIN
						SET @UserID = CAST(@DistrictID AS VARCHAR) + CAST(@UserTypeID AS VARCHAR) + ISNULL((SELECT MAX(RIGHT(UserID, 2)) FROM Master_User (NOLOCK) WHERE UserTypeID IN (21, 22) AND LEFT(UserLoginID, 4) = CAST(@DistrictID AS VARCHAR)), '00') + 1
						SET @UserLoginID = LEFT(@UserID, 4) + 'EO' + RIGHT(@UserID, 2)
					END
				ELSE
					BEGIN
						SET @UserID = ISNULL((SELECT MAX(UserID) FROM Master_User (NOLOCK) WHERE UserTypeID = @UserTypeID), CAST(@UserTypeID AS VARCHAR) + '000000') + 1
						SET @UserLoginID = (SELECT UserInitial FROM Master_UserType (NOLOCK) WHERE UserTypeID = @UserTypeID) + RIGHT(CAST(@UserID AS VARCHAR), 3)
					END

				INSERT INTO Master_User (UserID, UserTypeID, UserLoginID, UserPassword, UserName, UserMobileNo, UserEmailID, IsActive, ModifiedDateTime, ModifiedBy, ModifiedByIPAddress)
				VALUES (@UserID, @UserTypeID, @UserLoginID, @UserPassword, @UserName, @UserMobileNo, @UserEmailID, 1, dbo.fnGetISTDateTime(), @ModifiedBy, @ModifiedByIPAddress)
			END

		INSERT INTO Master_User_History (UserID, UserTypeID, UserLoginID, UserPassword, UserName, UserMobileNo, UserEmailID, IsActive, ModifiedDateTime, ModifiedBy, ModifiedByIPAddress)
		SELECT UserID, UserTypeID, UserLoginID, UserPassword, UserName, UserMobileNo, UserEmailID, IsActive, ModifiedDateTime, ModifiedBy, ModifiedByIPAddress FROM Master_User (NOLOCK) WHERE UserID = @UserID

		COMMIT TRAN
		SET @IsDone = 'Y'
	END TRY
	BEGIN CATCH
		IF(@@TRANCOUNT > 0)
			ROLLBACK TRAN
			
		SET @IsDone = 'N'
		 
		INSERT INTO Log_ErrorDetails(LogSource, ErrorMessage, LogDate, UserLoginID)
		VALUES(ERROR_PROCEDURE(), ERROR_MESSAGE(), dbo.fnGetISTDateTime(), @ModifiedBy) 
	END CATCH
 
	SELECT @IsDone AS IsOk
