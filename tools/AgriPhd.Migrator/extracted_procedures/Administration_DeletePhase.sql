CREATE PROCEDURE [dbo].[Administration_DeletePhase]  
    @PhaseID INT,  
    @UserLoginID VARCHAR(50),  
    @IPAddress VARCHAR(50)  
AS  
    DECLARE @IsDone VARCHAR(500) = 'N'  
  
    BEGIN TRY  
        BEGIN TRAN  
  
        -- =========================================================================================
        -- HISTORY TABLE INSERT (Delete karne se pehle backup - agar table ho to uncomment karein)
        -- =========================================================================================
        /*
        INSERT INTO [dbo].[Master_Phase_History] 
        (
            PhaseID, Phase, AllotmentDisplayStartDate, AdmissionStartDate, CandidateAdmissionLastDate, 
            CollegeAdmissionLastDate, SystemAdmissionLastDate, IsCurrentPhase, IsActive, 
            ModifiedDateTime, ModifiedBy, ModifiedByIPAddress,
            ActionType -- Ek naya column add kar sakte hain history me: 'DELETED'
        )
        SELECT 
            PhaseID, Phase, AllotmentDisplayStartDate, AdmissionStartDate, CandidateAdmissionLastDate, 
            CollegeAdmissionLastDate, SystemAdmissionLastDate, IsCurrentPhase, IsActive, 
            dbo.fnGetISTDateTime(), @UserLoginID, @IPAddress, 'DELETED'
        FROM [dbo].[Master_Phase] (NOLOCK) 
        WHERE PhaseID = @PhaseID
        */
        -- =========================================================================================

        -- Hard Delete Phase record
        DELETE FROM [dbo].[Master_Phase]
        WHERE PhaseID = @PhaseID  
  
        COMMIT TRAN  
        SET @IsDone = 'Y'  
    END TRY  
    BEGIN CATCH  
        IF(@@TRANCOUNT > 0)  
            ROLLBACK TRAN  
  
        SET @IsDone = 'N'  
  
        -- Error Logging
        INSERT INTO Log_ErrorDetails(LogSource, ErrorMessage, LogDate, UserLoginID)  
        VALUES(ERROR_PROCEDURE(), ERROR_MESSAGE(), dbo.fnGetISTDateTime(), @UserLoginID)   
    END CATCH  
  
    -- Return Status
    SELECT @IsDone AS IsOk
