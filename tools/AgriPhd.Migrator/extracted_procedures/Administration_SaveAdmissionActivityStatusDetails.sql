CREATE PROCEDURE [dbo].[Administration_SaveAdmissionActivityStatusDetails]
	@PhaseID SMALLINT,
	@AllotmentDisplayStartDate DATETIME,
	@AdmissionStartDate DATETIME,
	@CandidateAdmissionLastDate DATETIME,
	@CollegeAdmissionLastDate DATETIME,
	@SystemAdmissionLastDate DATETIME,
	@IsCurrentPhase BIT,
	@IsActive BIT,
	@ModifiedBy VARCHAR(50),
	@ModifiedByIPAddress VARCHAR(50)
AS
	DECLARE @IsDone VARCHAR(500) = 'N'

	BEGIN TRY
		BEGIN TRAN
			
		UPDATE Master_Phase
		SET AllotmentDisplayStartDate = @AllotmentDisplayStartDate, AdmissionStartDate = @AdmissionStartDate, CandidateAdmissionLastDate = @CandidateAdmissionLastDate, CollegeAdmissionLastDate = @CollegeAdmissionLastDate, SystemAdmissionLastDate = @SystemAdmissionLastDate, IsCurrentPhase = @IsCurrentPhase, IsActive = @IsActive, ModifiedDateTime = dbo.fnGetISTDateTime(), ModifiedBy = @ModifiedBy, ModifiedByIPAddress = @ModifiedByIPAddress
		WHERE PhaseID = @PhaseID

		INSERT INTO Master_Phase_History (PhaseID, Phase, AllotmentDisplayStartDate, AdmissionStartDate, CandidateAdmissionLastDate, CollegeAdmissionLastDate, SystemAdmissionLastDate, IsCurrentPhase, IsActive, ModifiedDateTime, ModifiedBy, ModifiedByIPAddress)
		SELECT PhaseID, Phase, AllotmentDisplayStartDate, AdmissionStartDate, CandidateAdmissionLastDate, CollegeAdmissionLastDate, SystemAdmissionLastDate, IsCurrentPhase, IsActive, dbo.fnGetISTDateTime(), @ModifiedBy, @ModifiedByIPAddress
		FROM Master_Phase (NOLOCK)
		WHERE PhaseID = @PhaseID

		COMMIT TRAN
		SET @IsDone = 'Y' 
	END TRY
	BEGIN CATCH
        SET @IsDone = 'N'
                                
		INSERT INTO Log_ErrorDetails(LogSource, ErrorMessage, LogDate, UserLoginID)
		VALUES(ERROR_PROCEDURE(), ERROR_MESSAGE(), dbo.fnGetISTDateTime(), @ModifiedBy) 
    END CATCH

    SELECT @IsDone AS IsOk
