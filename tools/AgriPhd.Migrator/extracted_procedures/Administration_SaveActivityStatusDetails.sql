
CREATE   PROCEDURE [dbo].[Administration_SaveActivityStatusDetails]
	@RegionID SMALLINT,
	@ActivityName VARCHAR(100),
	@ActivityStartDateTime DATETIME,
	@ActivityEndDateTime DATETIME,
	@ModifiedBy VARCHAR(50),
	@ModifiedByIPAddress VARCHAR(50)
AS
	DECLARE @IsDone VARCHAR(500) = 'N'

	BEGIN TRY
		BEGIN TRAN
			
		UPDATE Master_ActivityStatus
		SET ActivityStartDateTime = @ActivityStartDateTime, ActivityEndDateTime = @ActivityEndDateTime, ModifiedDateTime = dbo.fnGetISTDateTime(), ModifiedBy = @ModifiedBy, ModifiedByIPAddress = @ModifiedByIPAddress
		WHERE RegionID = @RegionID AND ActivityName = @ActivityName

		INSERT INTO Master_ActivityStatus_History (RegionID, ActivityName, ActivityDetails, ActivityStartDateTime, ActivityEndDateTime, SeqNo, IsActive, ModifiedDateTime, ModifiedBy, ModifiedByIPAddress)
		SELECT RegionID, ActivityName, ActivityDetails, ActivityStartDateTime, ActivityEndDateTime, SeqNo, IsActive, dbo.fnGetISTDateTime(), @ModifiedBy, @ModifiedByIPAddress
		FROM Master_ActivityStatus (NOLOCK)
		WHERE RegionID = @RegionID AND ActivityName = @ActivityName

		COMMIT TRAN
		SET @IsDone = 'Y' 
	END TRY
	BEGIN CATCH
        SET @IsDone = 'N'
                                
		INSERT INTO Log_ErrorDetails(LogSource, ErrorMessage, LogDate, UserLoginID)
		VALUES(ERROR_PROCEDURE(), ERROR_MESSAGE(), dbo.fnGetISTDateTime(), @ModifiedBy) 
    END CATCH

    SELECT @IsDone AS IsOk
