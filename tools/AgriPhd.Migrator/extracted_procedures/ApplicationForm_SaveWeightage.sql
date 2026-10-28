





CREATE           PROCEDURE [dbo].[ApplicationForm_SaveWeightage] 
	-- [ApplicationForm_SaveWeightage] 100205,'EVC10001',':1',1
    @CandidateID BIGINT,
    @UserLoginID VARCHAR(50),
    @IPAddress VARCHAR(50),
    @WeightageID INT,
    @IsOk BIT OUTPUT  -- Output parameter to indicate success or failure
AS
SET NOCOUNT ON
DECLARE 
	@IsEligible BIT = 0, 
    @ErrMsg VARCHAR(250) = '',
    @IsDone VARCHAR(500) = 'N',
    @CurrentDateTime DATETIME = dbo.fnGetISTDateTime()
BEGIN
	SELECT @IsEligible = 1
	--ISNULL(IsEligible, 0), @ErrMsg = ErrMsg               
 --   FROM dbo.fnCheckApplicationFormFillingEligiblity(@CandidateID, @UserLoginID)   

	IF @IsEligible = 1
	BEGIN
		IF EXISTS (SELECT 1 FROM ApplicationForm_Weightage WHERE CandidateID = @CandidateID AND WeightageID = @WeightageID)
		BEGIN
			INSERT INTO ApplicationForm_Weightage_History               
				(CandidateID, WeightageID, Weightage, IsDocumentVerified, ModifiedDateTime, ModifiedBy, ModifiedByIPAddress)                
			SELECT               
				CandidateID, WeightageID, Weightage, IsDocumentVerified, dbo.fnGetISTDateTime(), @UserLoginID, @IPAddress               
			FROM ApplicationForm_Weightage               
			WHERE CandidateID = @CandidateID  AND WeightageID = @WeightageID

			DELETE FROM ApplicationForm_Weightage WHERE CandidateID = @CandidateID  AND WeightageID = @WeightageID
		END
		
		IF EXISTS (SELECT 1 FROM ApplicationForm_NAASPaperParticipate WHERE CandidateID = @CandidateID AND WheatherParticipatedNAAS = 1)
		BEGIN
			INSERT INTO ApplicationForm_Weightage (CandidateID, WeightageID, Weightage, IsDocumentVerified, CreatedBy, CreatedByIPAddress, CreatedDateTime)
			SELECT DISTINCT @CandidateID,@WeightageID,0.05,ISNULL(ApplicationForm_DocumentDetails.IsVerified, 0),
					@UserLoginID AS CreatedBy,
					@IPAddress AS IPAddress,
					@CurrentDateTime
			FROM ApplicationForm_NAASPaperDetails INNER JOIN ApplicationForm_DocumentDetails
				ON ApplicationForm_DocumentDetails.CandidateID = @CandidateID
			INNER JOIN Master_Weightage
				ON Master_Weightage.WeightageID = ApplicationForm_NAASPaperDetails.WeightageID
				AND ApplicationForm_DocumentDetails.DocumentID = Master_Weightage.DocumentID 
				AND Master_Weightage.WeightageID = @WeightageID
				--AND IsDocumentUploaded = 1         
				AND (IsVerified = 0 OR (IsVerified = 1 AND VerificationStatus IN ('Y','H')))  
		END

		SET @IsOk = 1

	END -- IF @IsEligible = 1
	ELSE
		SET @IsOk = 0

	--SELECT ISNULL(MAX(WeightageID),0) + 1 FROM ApplicationForm_NAASPaperDetails WHERE CandidateID = 100205
	--SELECT * FROM ApplicationForm_Weightage

	--SELECT * FROM ApplicationForm_DocumentDetails WHERE CandidateID = 100205

	

    --BEGIN TRY                
    --    DECLARE @DebateDocumentID SMALLINT                
    --    DECLARE @NSSDocumentID SMALLINT                
    --    DECLARE @NCCDocumentID SMALLINT                
    --    DECLARE @IsDebateDocumentVerified BIT = 0                
    --    DECLARE @IsNSSorNCCDocumentVerified BIT = 0                        
    --    DECLARE @IsNCCNSSEligible BIT = 0                
            
    --    IF EXISTS (        
    --        SELECT ApplicationForm_DocumentDetails.DocumentID         
    --        FROM ApplicationForm_DocumentDetails           
    --        JOIN Master_Weightage         
    --            ON ApplicationForm_DocumentDetails.CandidateID = @CandidateID            
    --            AND ApplicationForm_DocumentDetails.DocumentID = Master_Weightage.DocumentID          
    --        WHERE Master_Weightage.WeightageType = 'O'         
    --            AND IsDocumentUploaded = 1         
    --            AND (IsVerified = 0 OR (IsVerified = 1 AND VerificationStatus = 'Y'))        
    --    )        
    --    BEGIN           
    --        SET @IsNSSorNCCDocumentVerified = 1            
    --    END           
                  
    --    SELECT                 
    --        @DebateDocumentID = MAX(CASE WHEN WeightageType = 'D' THEN DocumentID END),                
    --        @NSSDocumentID = MAX(CASE WHEN WeightageType = 'O' AND WeightageSubType = 'S' THEN DocumentID END),                
    --        @NCCDocumentID = MAX(CASE WHEN WeightageType = 'O' AND WeightageSubType = 'N' THEN DocumentID END)                
    --    FROM Master_Weightage        
                
    --    IF EXISTS (        
    --        SELECT IsVerified          
    --        FROM ApplicationForm_DocumentDetails               
    --        WHERE (documentid = @NSSDocumentID OR documentid = @NCCDocumentID)                
    --          AND IsDocumentUploaded = 1         
    --          AND (IsVerified = 0 OR (IsVerified = 1 AND VerificationStatus = 'Y'))          
    --    )                
    --    BEGIN                
    --        SET @IsNCCNSSEligible = 0                
    --    END                
              
    --    --SELECT @IsEligible = ISNULL(IsEligible, 0), @ErrMsg = ErrMsg               
    --    --FROM dbo.fnCheckApplicationFormFillingEligiblity(@CandidateID, @UserLoginID)        
    
    --    SET @IsEligible=1 --No Need to check the eligibility as score is calculated automatically     
    
    
    --    IF (@IsEligible = 1)  -- If eligible, then update the score              
    --    BEGIN                    
    --        BEGIN TRAN        
                                      
    --        -- Insert into ApplicationForm_Weightage_History                
    --        INSERT INTO ApplicationForm_Weightage_History               
    --            (CandidateID, WeightageID, Weightage, IsDocumentVerified, ModifiedDateTime, ModifiedBy, ModifiedByIPAddress)                
    --        SELECT               
    --            CandidateID, WeightageID, Weightage, IsDocumentVerified, dbo.fnGetISTDateTime(), @UserLoginID, @IPAddress               
    --        FROM ApplicationForm_Weightage               
    --        WHERE CandidateID = @CandidateID        
                    
    --        -- Delete from ApplicationForm_Weightage                
    --        DELETE FROM ApplicationForm_Weightage            
    --        WHERE CandidateID = @CandidateID        
                    
    --        -- Insert into ApplicationForm_Weightage                
    --        INSERT INTO ApplicationForm_Weightage               
    --            (CandidateID, WeightageID, Weightage, IsDocumentVerified, CreatedBy, CreatedByIPAddress, CreatedDateTime)                
    --        SELECT                
    --            @CandidateID AS CandidateID,                
    --            Master_SportsRank.SportsRankID,                
    --   Master_SportsRank.Points AS ActualPoints,                
    --            ISNULL(ApplicationForm_DocumentDetails.IsVerified, 0),          
    --            @UserLoginID AS CreatedBy,                
    --            @IPAddress AS IPAddress,                
    --            @CurrentDateTime                
    --        FROM                 
    --            ApplicationForm_SportsDetails                 
    --            JOIN Master_SportsRank               
    --                ON ApplicationForm_SportsDetails.SportsRankID = Master_SportsRank.SportsRankID               
    --                AND ApplicationForm_SportsDetails.CandidateID = @CandidateID                
    --            JOIN Master_Weightage               
    --                ON Master_Weightage.WeightageID = ApplicationForm_SportsDetails.SportsRankID                 
    --                AND Master_Weightage.WeightageType = 'S'                
    --            JOIN ApplicationForm_DocumentDetails         
    --                ON ApplicationForm_DocumentDetails.CandidateID = @CandidateID           
    --                AND ApplicationForm_DocumentDetails.DocumentID = Master_Weightage.DocumentID           
    --                AND IsDocumentUploaded = 1         
    --                AND (IsVerified = 0 OR (IsVerified = 1 AND VerificationStatus = 'Y'))        
                            
    --        UNION        
        
    --        -- NCC and NSS participation                
    --        SELECT                 
    --            @CandidateID AS CandidateID,                
    --            CASE WHEN IsNCCDone = 1 OR IsNSSDone = 1 THEN 17 END AS WeightageID,                 
    --            0.12 AS ActualPoints,                
    --            @IsNSSorNCCDocumentVerified,          
    --            @UserLoginID AS CreatedBy,                
    --            @IPAddress AS IPAddress,                
    --            @CurrentDateTime                
    --        FROM ApplicationForm_CategoryAndOtherReservationDetails                
    --        WHERE                 
    --            CandidateID = @CandidateID         
    --            AND @IsNSSorNCCDocumentVerified = 1          
                        
    --        UNION                
              
    --        -- Debate Participation                
    --        SELECT                 
    --            @CandidateID AS CandidateID,                
    --            19 AS WeightageID,                
    --            0.12 AS ActualPoints,                
    --            ISNULL(        
    --                (SELECT IsVerified          
    --                 FROM ApplicationForm_DocumentDetails               
    --                 WHERE documentid = @DebateDocumentID                
    --                   AND IsDocumentUploaded = 1         
    --                   AND IsVerified = 1         
    --                   AND VerificationStatus = 'Y'             
    --                   AND CandidateID = @CandidateID), 0),                
    --            @UserLoginID AS CreatedBy,                
    --            @IPAddress AS IPAddress,                
    --            @CurrentDateTime                
    --        FROM ApplicationForm_CategoryAndOtherReservationDetails            
    --        JOIN ApplicationForm_DocumentDetails         
    --            ON ApplicationForm_DocumentDetails.CandidateID = @CandidateID         
    --            AND (IsDebate = 1)           
    --            AND ApplicationForm_DocumentDetails.DocumentID = 14 -- Document ID Master (Debate)          
    --            AND IsDocumentUploaded = 1         
    --            AND (IsVerified = 0 OR (IsVerified = 1 AND VerificationStatus = 'Y'))        
                    
    --        SET @IsDone = 'Y'              
    --        SET @IsOk = 1  -- Indicate success              
    --        COMMIT TRAN                
    --    END                 
    --    ELSE                
    --    BEGIN                
    --        SET @IsDone = @ErrMsg                
    --        SET @IsOk = 0  -- Indicate failure              
    --    END        
    --END TRY                
    --BEGIN CATCH                
    --    IF(@@TRANCOUNT > 0)                
    --        ROLLBACK TRAN        
              
    --    SET @IsDone = 'N'              
    --    SET @IsOk = 0  -- Indicate failure              
                      
    --    INSERT INTO Log_ErrorDetails (LogSource, ErrorMessage, LogDate, UserLoginID)                
    --    VALUES(ERROR_PROCEDURE(), ERROR_MESSAGE(), dbo.fnGetISTDateTime(), @UserLoginID)                 
    --END CATCH                
                 
    --RETURN @IsOk  -- Return the value of @IsOk to indicate success or failure              
END 

