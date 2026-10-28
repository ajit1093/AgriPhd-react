CREATE PROCEDURE [dbo].[ApplicationForm_SaveQualificationDetails]        
 @CandidateID BIGINT,        
 /*@HighestQualificationID SMALLINT,         
 @IsEducationalGap BIT,         
 @EducationalGapYears SMALLINT,         
 @EducationalGapReason VARCHAR(100),         
 @EligibilityQualificationID SMALLINT,         
 @SeatNo VARCHAR(20),         
 @NoOfAttempts SMALLINT,         
 @PassingDistrictID INT,         
 @PassingYear SMALLINT,         
 @BoardID SMALLINT,         
 @MarksObtained INT,         
 @MarksOutOf INT,         
 @Percentage NUMERIC(6, 2),   */      
 @NameOfCollege VARCHAR(100),      
 @CollegeStateID SMALLINT,      
 @CollegeDistrictID SMALLINT,      
 @CollegeTalukaID SMALLINT,      
 @CollegeTaluka VARCHAR(50),      
 @CollegeCity VARCHAR(50),      
 @CollegePinCode VARCHAR(10),      
 @BachlorDegreeID SMALLINT,      
 @CGPA        DECIMAL(4,2),      
 @NoOfYearsToComplete SMALLINT,      
 @IsEmployed SMALLINT,      
 --@UGCategoryofAdmission  VARCHAR(20),      
 --@UGSubCategoryofAdmission  VARCHAR(20),      
 @FacultyID   SMALLINT,
 @SubjectID   SMALLINT,  
 @UserLoginID VARCHAR(50),          
 @IPAddress VARCHAR(50),              
 @PageCode VARCHAR(50)        
AS        
 DECLARE @IsEligible BIT = 0        
 DECLARE @ErrMsg VARCHAR(250) = ''        
 DECLARE @IsInnerProcOk BIT = 0        
 DECLARE @IsDone VARCHAR(500) = 'N'        
        
 BEGIN TRY        
        
  SELECT @IsEligible = ISNULL(IsEligible, 0), @ErrMsg = ErrMsg FROM dbo.fnCheckApplicationFormFillingEligiblity(@CandidateID, @UserLoginID)        
          
  IF (@IsEligible = 1)        
   BEGIN        
    BEGIN TRAN        
        
    IF EXISTS (SELECT 1 FROM ApplicationForm_QualificationDetails (NOLOCK) WHERE CandidateID = @CandidateID)        
     BEGIN        
      UPDATE ApplicationForm_QualificationDetails        
      SET       
   CollegeName = @NameOfCollege,      
   CollegeCity = @CollegeCity,      
   DegreeID = @BachlorDegreeID,      
   CollegeStateID = @CollegeStateID,      
   CollegeDistrictID = @CollegeDistrictID,      
   CollegeTalukaID = @CollegeTalukaID,      
   CollegePinCode=@CollegePinCode,      
   CollegeTaluka = @CollegeTaluka,      
   NoOfYearsToComplete = @NoOfYearsToComplete,      
   AreYouEmployed = @IsEmployed,      
   CGPAScore = @CGPA,      
   --UGCategoryofAdmission=@UGCategoryofAdmission,      
   --UGSubCategoryofAdmission=@UGSubCategoryofAdmission,      
   --HighestQualificationID = @HighestQualificationID, IsEducationalGap = @IsEducationalGap, EducationalGapYears = @EducationalGapYears, EducationalGapReason = @EducationalGapReason, EligibilityQualificationID = @EligibilityQualificationID, SeatNo =      
 
   --@SeatNo, NoOfAttempts = @NoOfAttempts, PassingDistrictID = @PassingDistrictID, PassingYear = @PassingYear, BoardID = @BoardID, MarksObtained = @MarksObtained, MarksOutOf = @MarksOutOf, Percentage = @Percentage,       
   ModifiedDateTime = dbo.fnGetISTDateTime(),ModifiedBy = @UserLoginID, ModifiedByIPAddress = @IPAddress,  
   FacultyID=@FacultyID ,SubjectID = @SubjectID 
      WHERE CandidateID = @CandidateID        
     END         
    ELSE        
     BEGIN        
      --INSERT INTO ApplicationForm_QualificationDetails (CandidateID, HighestQualificationID, IsEducationalGap, EducationalGapYears, EducationalGapReason, EligibilityQualificationID, SeatNo, NoOfAttempts, PassingDistrictID, PassingYear, BoardID,       
   --MarksObtained, MarksOutOf, Percentage, CreatedDateTime, CreatedBy, CreatedByIPAddress)        
      --VALUES (@CandidateID, @HighestQualificationID, @IsEducationalGap, @EducationalGapYears, @EducationalGapReason, @EligibilityQualificationID, @SeatNo, @NoOfAttempts, @PassingDistrictID, @PassingYear, @BoardID, @MarksObtained, @MarksOutOf, @Percentage,      
 --dbo.fnGetISTDateTime(), @UserLoginID, @IPAddress)        
      
 INSERT INTO ApplicationForm_QualificationDetails (      
 CandidateID,      
    CollegeName,      
    CollegeCity,      
 CollegePinCode,      
    DegreeID,      
    CollegeStateID,      
    CollegeDistrictID,      
    CollegeTalukaID,      
    CollegeTaluka,      
    NoOfYearsToComplete,      
    AreYouEmployed,      
    CGPAScore,  
    FacultyID,
	SubjectID,
    --UGCategoryofAdmission,      
    --UGSubCategoryofAdmission,      
 CreatedDateTime,       
 CreatedBy,       
 CreatedByIPAddress      
) VALUES (      
@CandidateID,      
    @NameOfCollege,      
    @CollegeCity,      
 @CollegePinCode,      
    @BachlorDegreeID,      
    @CollegeStateID,      
    @CollegeDistrictID,      
    @CollegeTalukaID,      
    @CollegeTaluka,      
    @NoOfYearsToComplete,      
    @IsEmployed,      
    @CGPA,      
    --@UGCategoryofAdmission,      
    --@UGSubCategoryofAdmission,   
 @FacultyID, 
 @SubjectID,
 dbo.fnGetISTDateTime(),      
 @UserLoginID,       
 @IPAddress      
);      
      
     END         
        
    IF EXISTS (SELECT 1 FROM ApplicationForm_QualificationDetails (NOLOCK) WHERE CandidateID = @CandidateID)        
     BEGIN        
      EXEC ApplicationForm_SetRequiredDocuments @CandidateID, @UserLoginID, @PageCode, @IPAddress, @IsInnerProcOk OUTPUT        
        
      IF(@IsInnerProcOk = 1)        
       BEGIN        
        SET @IsInnerProcOk = 0        
        EXEC ApplicationForm_UpdateStatus @CandidateID, @UserLoginID, @PageCode, @IPAddress, @IsInnerProcOk OUTPUT        
       END         
                 
      IF (@IsInnerProcOk = 1)        
       BEGIN              
        COMMIT TRAN        
        SET @IsDone = 'Y'        
       END         
      ELSE        
       BEGIN        
        ROLLBACK TRAN        
        SET @IsDone = 'N'        
       END        
     END         
    ELSE        
     BEGIN        
      ROLLBACK TRAN        
      SET @IsDone = 'N'        
     END        
   END         
  ELSE        
   BEGIN        
    SET @IsDone = @ErrMsg        
   END        
 END TRY        
 BEGIN CATCH        
  IF(@@TRANCOUNT > 0)        
   ROLLBACK TRAN        
           
  SET @IsDone = 'N'        
           
  INSERT INTO Log_ErrorDetails(LogSource, ErrorMessage, LogDate, UserLoginID)        
  VALUES(ERROR_PROCEDURE(), ERROR_MESSAGE(), dbo.fnGetISTDateTime(), @UserLoginID)         
 END CATCH        
         
 SELECT @IsDone AS IsOk   
