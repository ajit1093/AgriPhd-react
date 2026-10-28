  
  
CREATE   PROCEDURE [dbo].[ApplicationForm_SaveNAASParticipationDetails]            
    @CandidateID BIGINT,          
    @WheatherParticipatedNAAS BIT,          
    @UserLoginID VARCHAR(50),              
    @IPAddress VARCHAR(50),                  
    @PageCode VARCHAR(50)            
AS            
DECLARE       
    @IsEligible BIT = 0,            
    @ErrMsg VARCHAR(250) = '',              
    @IsInnerProcOk BIT = 0,          
    @IsDone VARCHAR(500) = 'N';            
            
BEGIN TRY            
    -- Assume the eligibility check function exists for sports participation          
    SELECT       
        @IsEligible = ISNULL(IsEligible, 0),       
        @ErrMsg = ErrMsg       
    FROM dbo.fnCheckApplicationFormFillingEligiblity(@CandidateID, @UserLoginID);            
              
    IF (@IsEligible = 1)            
    BEGIN            
        BEGIN TRAN;                  
        IF EXISTS (SELECT 1 FROM ApplicationForm_NAASPaperParticipate (NOLOCK) WHERE CandidateID = @CandidateID)            
        BEGIN            
            UPDATE ApplicationForm_NAASPaperParticipate            
            SET           
                WheatherParticipatedNAAS = @WheatherParticipatedNAAS,          
                ModifiedDateTime = dbo.fnGetISTDateTime(),          
                ModifiedBy = @UserLoginID,           
                ModifiedByIPAddress = @IPAddress            
            WHERE CandidateID = @CandidateID;            
        
            IF(@WheatherParticipatedNAAS = 0)        
            BEGIN         
                DELETE FROM ApplicationForm_NAASPaperDetails WHERE CandidateID = @CandidateID;        
            END;      
      
        END             
        ELSE            
        BEGIN            
            INSERT INTO ApplicationForm_NAASPaperParticipate (          
                CandidateID,          
                WheatherParticipatedNAAS,          
                CreatedDateTime,           
                CreatedBy,           
                CreatedByIPAddress,          
                ModifiedDateTime,          
                ModifiedBy,          
                ModifiedByIPAddress          
            ) VALUES (          
                @CandidateID,          
                @WheatherParticipatedNAAS,          
                dbo.fnGetISTDateTime(),          
                @UserLoginID,           
                @IPAddress,          
                dbo.fnGetISTDateTime(),          
                @UserLoginID,           
                @IPAddress          
            );          
        END;             
            
        --IF EXISTS (SELECT 1 FROM ApplicationForm_SportsParticipate (NOLOCK) WHERE CandidateID = @CandidateID)            
        --BEGIN                        
          
            --EXEC ApplicationForm_SetRequiredDocuments @CandidateID, @UserLoginID, 'SportsAllDocs', @IPAddress, @IsInnerProcOk OUTPUT;      
            -- Code for required documents           
   SET @IsInnerProcOk=1     
            IF(@IsInnerProcOk = 1)            
            BEGIN            
                SET @IsInnerProcOk = 0;            
                EXEC ApplicationForm_UpdateStatus @CandidateID, @UserLoginID, @PageCode, @IPAddress, @IsInnerProcOk OUTPUT;            
            END;             
        
   --  
   --IF (@IsInnerProcOk = 1)                  
   --BEGIN         
   -- SET @IsInnerProcOk = 0;                  
   -- EXEC ApplicationForm_SaveWeightage @CandidateID,@UserLoginID,@IPAddress,@PageCode,@IsInnerProcOk OUTPUT;        
   --END     
   ----  
            IF (@IsInnerProcOk = 1)            
            BEGIN                  
                COMMIT TRAN;            
                SET @IsDone = 'Y';            
            END             
            ELSE            
            BEGIN            
                ROLLBACK TRAN;            
                SET @IsDone = 'N';            
            END;            
        --END             
        --ELSE            
        --BEGIN            
   --ROLLBACK TRAN;            
            --SET @IsDone = 'N';            
        --END;            
    END             
    ELSE            
    BEGIN            
        SET @IsDone = @ErrMsg;            
    END;            
END TRY            
BEGIN CATCH            
    IF(@@TRANCOUNT > 0)            
        ROLLBACK TRAN;            
               
    SET @IsDone = 'N';            
               
    INSERT INTO Log_ErrorDetails(LogSource, ErrorMessage, LogDate, UserLoginID)            
    VALUES(ERROR_PROCEDURE(), ERROR_MESSAGE(), dbo.fnGetISTDateTime(), @UserLoginID);             
END CATCH;            
             
SELECT @IsDone AS IsOk;   
