CREATE PROCEDURE [dbo].[Administration_SavePhase]
    @PhaseID INT,
    @Phase VARCHAR(100),
    @AllotmentDisplayStartDate DATETIME,
    @AdmissionStartDate DATETIME,
    @CandidateAdmissionLastDate DATETIME,
    @CollegeAdmissionLastDate DATETIME,
    @SystemAdmissionLastDate DATETIME,
    @IsCurrentPhase SMALLINT,
    @IsActive SMALLINT,
    @UserLoginID VARCHAR(50),
    @IPAddress VARCHAR(50)
AS
BEGIN
    DECLARE @PhaseTbl TABLE (PhaseID INT)
    DECLARE @IsDone VARCHAR(500) = 'N'

    BEGIN TRY
        BEGIN TRAN

        IF (@PhaseID > 0)
        BEGIN
            -- Update Existing Phase
            UPDATE [dbo].[Master_Phase]
            SET 
                Phase = @Phase,
                AllotmentDisplayStartDate = @AllotmentDisplayStartDate,
                AdmissionStartDate = @AdmissionStartDate,
                CandidateAdmissionLastDate = @CandidateAdmissionLastDate,
                CollegeAdmissionLastDate = @CollegeAdmissionLastDate,
                SystemAdmissionLastDate = @SystemAdmissionLastDate,
                IsCurrentPhase = @IsCurrentPhase,
                IsActive = @IsActive,
                ModifiedDateTime = dbo.fnGetISTDateTime(),
                ModifiedBy = @UserLoginID,
                ModifiedByIPAddress = @IPAddress
            WHERE PhaseID = @PhaseID
        END
        ELSE
        BEGIN
            -- Insert New Phase (Assuming PhaseID is set to Identity(1,1))
            INSERT INTO [dbo].[Master_Phase] 
            (
                Phase, AllotmentDisplayStartDate, AdmissionStartDate, CandidateAdmissionLastDate, 
                CollegeAdmissionLastDate, SystemAdmissionLastDate, IsCurrentPhase, IsActive, 
                ModifiedDateTime, ModifiedBy, ModifiedByIPAddress
            )
            OUTPUT inserted.PhaseID INTO @PhaseTbl
            VALUES 
            (
                @Phase, @AllotmentDisplayStartDate, @AdmissionStartDate, @CandidateAdmissionLastDate, 
                @CollegeAdmissionLastDate, @SystemAdmissionLastDate, @IsCurrentPhase, @IsActive, 
                dbo.fnGetISTDateTime(), @UserLoginID, @IPAddress
            )

            -- Get the newly inserted PhaseID
            SET @PhaseID = (SELECT PhaseID FROM @PhaseTbl)
        END

        -- =========================================================================================
        -- HISTORY TABLE INSERT (Note: Agar 'Master_Phase_History' table nahi hai, to ise hata dein)
        -- =========================================================================================
        /*
        INSERT INTO [dbo].[Master_Phase_History] 
        (
            PhaseID, Phase, AllotmentDisplayStartDate, AdmissionStartDate, CandidateAdmissionLastDate, 
            CollegeAdmissionLastDate, SystemAdmissionLastDate, IsCurrentPhase, IsActive, 
            ModifiedDateTime, ModifiedBy, ModifiedByIPAddress
        )
        SELECT 
            PhaseID, Phase, AllotmentDisplayStartDate, AdmissionStartDate, CandidateAdmissionLastDate, 
            CollegeAdmissionLastDate, SystemAdmissionLastDate, IsCurrentPhase, IsActive, 
            dbo.fnGetISTDateTime(), @UserLoginID, @IPAddress 
        FROM [dbo].[Master_Phase] (NOLOCK) 
        WHERE PhaseID = @PhaseID
        */
        -- =========================================================================================

        COMMIT TRAN
        SET @IsDone = 'Y'
    END TRY
    BEGIN CATCH
        IF(@@TRANCOUNT > 0)
            ROLLBACK TRAN

        SET @IsDone = 'N'

        -- Log Error Details
        INSERT INTO Log_ErrorDetails(LogSource, ErrorMessage, LogDate, UserLoginID)
        VALUES(ERROR_PROCEDURE(), ERROR_MESSAGE(), dbo.fnGetISTDateTime(), @UserLoginID) 
    END CATCH

    -- Return Status
    SELECT @IsDone AS IsOk
END
