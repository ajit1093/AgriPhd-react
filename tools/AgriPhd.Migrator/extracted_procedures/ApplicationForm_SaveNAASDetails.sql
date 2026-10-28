

CREATE     PROCEDURE [dbo].[ApplicationForm_SaveNAASDetails]
-- [ApplicationForm_SaveNAASDetails] 100205,0,'TEST','TEST',2016,5,'242000026',':1','NAAS'
	@CandidateID BIGINT,
	@NAASDetailID INT,
	@PaperTitle VARCHAR(200),
	@NameOfPaper VARCHAR(100),
	@YearOfPublication INT,
	@NAASScore NUMERIC(6,2),
	@UserLoginID VARCHAR(50),
	@IPAddress VARCHAR(50),
	@PageCode VARCHAR(50)
AS
SET NOCOUNT ON
DECLARE 
	@IsDone VARCHAR(500) = 'N',    
    @IsInnerProcOk BIT = 0,
	@MaxWeightageID	SMALLINT = 0,
	@Cnt	TINYINT	= 0
BEGIN     
	BEGIN TRY    
		BEGIN TRANSACTION;    
        -- New Record Logic

        IF (@NAASDetailID IS NULL OR @NAASDetailID = '' OR @NAASDetailID = 0)     
        BEGIN
			
			SELECT @MaxWeightageID = ISNULL(MAX(WeightageID),0) + 1,@Cnt = COUNT(CandidateID) FROM ApplicationForm_NAASPaperDetails WHERE CandidateID = @CandidateID
			IF @MaxWeightageID > 5 AND @Cnt < 5
			BEGIN
				SELECT TOP 1 @MaxWeightageID = WeightageID FROM Master_Weightage 
				WHERE WeightageID NOT IN (SELECT WeightageID FROM ApplicationForm_NAASPaperDetails WHERE CandidateID = @CandidateID)
			END

			IF @Cnt <= 5 AND @MaxWeightageID BETWEEN 1 AND 5 
			BEGIN
				INSERT INTO ApplicationForm_NAASPaperDetails
				(
					CandidateID, PaperTitle, NameOfPaper, YearOfPublication, 
					NAASScore, WeightageID, CreatedBy, CreatedDateTime, 
					CreatedByIPAddress, ModifiedByIPAddress, 
					ModifiedDateTime, ModifiedBy
				)
				VALUES
				(
					@CandidateID, @PaperTitle, @NameOfPaper, @YearOfPublication, 
					@NAASScore, @MaxWeightageID, @UserLoginID, GETDATE(), 
					@IPAddress, @IPAddress, GETDATE(), @UserLoginID
				); 
			END
			
        END     
        ELSE IF (@NAASDetailID IS NOT NULL OR @NAASDetailID != '' OR @NAASDetailID != 0)  
        BEGIN
			SELECT @MaxWeightageID = WeightageID FROM ApplicationForm_NAASPaperDetails WHERE CandidateID = @CandidateID AND NAASDetailID = @NAASDetailID

            UPDATE ApplicationForm_NAASPaperDetails
            SET
                PaperTitle = @PaperTitle,
                NameOfPaper = @NameOfPaper,
                YearOfPublication = @YearOfPublication,
                NAASScore = @NAASScore,
                ModifiedDateTime = GETDATE(),
                ModifiedBy = @UserLoginID,
                ModifiedByIPAddress = @IPAddress    
            WHERE NAASDetailID = @NAASDetailID 
				AND CandidateID = @CandidateID;
        END    

		IF EXISTS (SELECT 1 FROM ApplicationForm_NAASPaperDetails (NOLOCK) WHERE CandidateID = @CandidateID)                    
		BEGIN
			EXEC ApplicationForm_SaveWeightage @CandidateID,@UserLoginID,@IPAddress,@MaxWeightageID,@IsInnerProcOk OUTPUT;

			IF(@IsInnerProcOk = 1)        
			BEGIN
				SET @IsInnerProcOk = 0;
				EXEC ApplicationForm_SetRequiredDocuments @CandidateID, @UserLoginID, @PageCode, @IPAddress, @IsInnerProcOk OUTPUT,@MaxWeightageID;

				IF (@IsInnerProcOk = 1)
				BEGIN
					SET @IsInnerProcOk = 0;
					EXEC ApplicationForm_UpdateStatus @CandidateID, @UserLoginID, @PageCode, @IPAddress, @IsInnerProcOk OUTPUT;
				END
			END
		END

        -- Commit the transaction after successful execution
        COMMIT TRANSACTION;    
        SET @IsDone = 'Y';    

    END TRY    
    BEGIN CATCH    
        -- Rollback the transaction in case of an error
        IF (@@TRANCOUNT > 0)    
            ROLLBACK TRANSACTION;    
        
        -- Log the error
        INSERT INTO Log_ErrorDetails(LogSource, ErrorMessage, LogDate, UserLoginID)    
        VALUES (ERROR_PROCEDURE(), ERROR_MESSAGE(), dbo.fnGetISTDateTime(), @UserLoginID);    

        SET @IsDone = 'N';    
    END CATCH    

    -- Return the status
    SELECT @IsDone AS IsOk;    
END;

