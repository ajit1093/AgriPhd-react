
CREATE   PROCEDURE [dbo].[ApplicationForm_DeleteNAASDetails]
    @CandidateID BIGINT,
    @NAASDetailID SMALLINT,
    @UserLoginID VARCHAR(50)
AS
SET NOCOUNT ON
DECLARE 
	@IsDone VARCHAR(500) = 'N',
	@IPAddress AS VARCHAR(100) = '',
	@WeightageID	SMALLINT,
	@DocumentID		SMALLINT

BEGIN 
    -- Initialize variables
    BEGIN TRY
    BEGIN TRANSACTION;

		SELECT @WeightageID = WeightageID FROM ApplicationForm_NAASPaperDetails WHERE CandidateID = @CandidateID AND NAASDetailID = @NAASDetailID
		SELECT @DocumentID = DocumentID FROM Master_Weightage WHERE WeightageID = @WeightageID

		-- Delete the record from the DOCUEMNT table
		DELETE FROM ApplicationForm_DocumentDetails WHERE CandidateID = @CandidateID AND DocumentID = @DocumentID

		-- Delete the record from the WEIGHATES table
		DELETE FROM ApplicationForm_Weightage WHERE CandidateID = @CandidateID AND WeightageID  = @WeightageID

        -- Delete the record from the NAASPaperDetails table
        DELETE FROM ApplicationForm_NAASPaperDetails
        WHERE CandidateID = @CandidateID 
          AND NAASDetailID = @NAASDetailID;


        -- If delete was successful, mark as done
        SET @IsDone = 'Y';

        -- Commit transaction
        COMMIT TRANSACTION;

    END TRY
    BEGIN CATCH
        -- Rollback transaction in case of an error
        IF (@@TRANCOUNT > 0)
            ROLLBACK TRANSACTION;
        
        -- Log the error details
        INSERT INTO Log_ErrorDetails (LogSource, ErrorMessage, LogDate, UserLoginID)
        VALUES (ERROR_PROCEDURE(), ERROR_MESSAGE(), dbo.fnGetISTDateTime(), @UserLoginID);

        -- Mark as not done
        SET @IsDone = 'N';
    END CATCH

    -- Return the result
    SELECT @IsDone AS IsOk;
END;

