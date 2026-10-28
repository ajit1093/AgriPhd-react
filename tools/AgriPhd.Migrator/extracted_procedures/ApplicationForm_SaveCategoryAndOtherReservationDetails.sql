
CREATE   PROCEDURE [dbo].[ApplicationForm_SaveCategoryAndOtherReservationDetails] 
--[ApplicationForm_SaveCategoryAndOtherReservationDetails] 100205,'M',1,1,1,1,'hindu',0,0,0,0,0,0,0,0,0,0,0,'242000022','','',0

 @CandidateID BIGINT,                    
 --@DomicileDistrictID INT,                     
 --@DomicileVillage VARCHAR(50),                     
 @Domicile VARCHAR(1),                
 @DomicileType SMALLINT,                
 @ReligionID SMALLINT,                
 @CategoryID SMALLINT,                     
 @FinalCategoryID SMALLINT,                     
 @Caste VARCHAR(50),                     
 @HasCasteCertificate BIT,                     
 @HasNCLCertificate BIT,                     
 @HasEWSCertificate BIT,                     
 @IsOrphan BIT,                     
 @IsPWD BIT,                     
 @IsExServiceman BIT,                     
 @IsFreedomFighter BIT,                    
 @IsProjectAffected BIT,                     
-- @IsNCC BIT,                     
 --@IsNCCDone  BIT,                
 --@IsNSSDone BIT,                
 --@IsDebate BIT,                     
 @IsIncomeSourceAgriculture BIT,                     
 @HasCasteValidityCertificate BIT,            
 @HasCasteValidityReceipt BIT,      
 @UserLoginID VARCHAR(50),                      
 @IPAddress VARCHAR(50),                          
 @PageCode VARCHAR(50),    
 @PreviousCategoryID SMALLINT
 
AS
SET NOCOUNT ON
 --DECLARE @DomicileDistrictID_Old INT = -1                    
 --DECLARE @IsPreferencesGiven BIT = 0                    
 DECLARE 
	@IsEligible BIT = 0,
	@ErrMsg VARCHAR(250) = '',
	@IsInnerProcOk BIT = 0,
	@IsDone VARCHAR(500) = 'N'
                    
BEGIN TRY                    
    SELECT                 
        @IsEligible = ISNULL(IsEligible, 0),                 
        @ErrMsg = ErrMsg                 
    FROM dbo.fnCheckApplicationFormFillingEligiblity(@CandidateID, @UserLoginID);                    
                    
  --SELECT @DomicileDistrictID_Old = DomicileDistrictID FROM ApplicationForm_CategoryAndOtherReservationDetails (NOLOCK) WHERE CandidateID = @CandidateID                    
  --SELECT @IsPreferencesGiven = 1 FROM ApplicationForm_AppliedCollegeDetails (NOLOCK) WHERE CandidateID = @CandidateID AND PreferenceNo > 0                    
  
  IF (@IsEligible = 1)                    
  BEGIN                    
   /* IF (@IsPreferencesGiven = 1 AND @DomicileDistrictID_Old != @DomicileDistrictID)                    
    BEGIN                    
      SET @IsDone = 'You have already applied for colleges of other district. If you want to change domicile district, first delete applied colleges.';                    
    END                    
    ELSE                    
    BEGIN  */                
      BEGIN TRAN;                        
      IF EXISTS (SELECT 1 FROM ApplicationForm_CategoryAndOtherReservationDetails (NOLOCK) WHERE CandidateID = @CandidateID)                    
      BEGIN                    
        UPDATE ApplicationForm_CategoryAndOtherReservationDetails                    
        SET                  
            CategoryID = @CategoryID,                 
            FinalCategoryID = @FinalCategoryID,                 
            Caste = @Caste,                 
            HasCasteCertificate = @HasCasteCertificate,                 
            HasNCLCertificate = @HasNCLCertificate,                   
            HasEWSCertificate = @HasEWSCertificate,                 
            IsOrphan = @IsOrphan,                 
            IsPWD = @IsPWD,                 
            IsExServiceman = @IsExServiceman,                   
            IsFreedomFighter = @IsFreedomFighter,                 
            IsProjectAffected = @IsProjectAffected,                 
            --IsNCC = @IsNCC,                 
            --IsNCCDone = @IsNCCDone,                 
            --IsNSSDone = @IsNSSDone,                
			Domicile=@Domicile,                
			DomicileType=@DomicileType,                
			ReligionID=@ReligionID,                
			--IsDebate= @IsDebate,        
			IsIncomeSourceAgriculture = @IsIncomeSourceAgriculture,          
			HasCasteValidity=@HasCasteValidityCertificate,            
			ModifiedDateTime = dbo.fnGetISTDateTime(),                 
			ModifiedBy = @UserLoginID,                 
			ModifiedByIPAddress = @IPAddress,      
			HasCasteValidityReceipt=@HasCasteValidityReceipt,    
			PreviousCategoryID=CASE @PreviousCategoryID WHEN 0 THEN NULL ELSE @PreviousCategoryID END    
        WHERE CandidateID = @CandidateID;                    
      END                     
      ELSE                    
      BEGIN                    
        INSERT INTO ApplicationForm_CategoryAndOtherReservationDetails (                
            CandidateID, ReligionID,CategoryID, FinalCategoryID, Caste, HasCasteCertificate, HasNCLCertificate,                 
          HasEWSCertificate, IsOrphan, IsPWD, IsExServiceman, IsFreedomFighter, IsProjectAffected,                 
            Domicile,DomicileType, IsIncomeSourceAgriculture,                 
             HasCasteValidity, CreatedDateTime, CreatedBy, CreatedByIPAddress,HasCasteValidityReceipt,PreviousCategoryID    
        )                    
        VALUES (                
            @CandidateID,@ReligionID, @CategoryID, @FinalCategoryID, @Caste, @HasCasteCertificate, @HasNCLCertificate,                 
            @HasEWSCertificate, @IsOrphan, @IsPWD, @IsExServiceman, @IsFreedomFighter, @IsProjectAffected,                 
           @Domicile,@DomicileType,@IsIncomeSourceAgriculture,                 
            @HasCasteValidityCertificate, dbo.fnGetISTDateTime(), @UserLoginID, @IPAddress,@HasCasteValidityReceipt,CASE @PreviousCategoryID WHEN 0 THEN NULL ELSE @PreviousCategoryID END    
        );                    
      END                     
                    
      IF EXISTS (SELECT 1 FROM ApplicationForm_CategoryAndOtherReservationDetails (NOLOCK) WHERE CandidateID = @CandidateID)                    
      BEGIN                    
        EXEC ApplicationForm_SetRequiredDocuments @CandidateID, @UserLoginID, @PageCode, @IPAddress, @IsInnerProcOk OUTPUT;                    
        
		

        IF(@IsInnerProcOk = 1)                    
        BEGIN                    
          SET @IsInnerProcOk = 0;                    
          EXEC ApplicationForm_UpdateStatus @CandidateID, @UserLoginID, @PageCode, @IPAddress, @IsInnerProcOk OUTPUT;                    
          
		  PRINT @IsInnerProcOk
		  
			--IF (@IsInnerProcOk = 1)                    
			--BEGIN           
			--   SET @IsInnerProcOk = 0;                    
			--   EXEC ApplicationForm_SaveWeightage @CandidateID,@UserLoginID,@IPAddress,@PageCode,@IsInnerProcOk OUTPUT;  
			--   PRINT @IsInnerProcOk
			--END           
        END
                             
        IF (@IsInnerProcOk = 1)                    
        BEGIN                          
          COMMIT TRAN;                    
          SET @IsDone = 'Y';                    
        END                     
        ELSE                    
        BEGIN                    
          ROLLBACK TRAN;                    
          SET @IsDone = 'N';                    
        END                    
      END                     
      ELSE                    
      BEGIN                    
        ROLLBACK TRAN;                    
        SET @IsDone = 'N';                    
      END                    
  END                     
  ELSE                    
  BEGIN                    
    SET @IsDone = @ErrMsg;                    
  END                    
END TRY                    
BEGIN CATCH                    
  IF(@@TRANCOUNT > 0)                    
    ROLLBACK TRAN;                    
                       
  SET @IsDone = 'N';                    
                       
  INSERT INTO Log_ErrorDetails(LogSource, ErrorMessage, LogDate, UserLoginID)                    
  VALUES(ERROR_PROCEDURE(), ERROR_MESSAGE(), dbo.fnGetISTDateTime(), @UserLoginID);                     
END CATCH;                    
          
SELECT @IsDone AS IsOk; 

