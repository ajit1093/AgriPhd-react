CREATE     PROCEDURE [dbo].[ApplicationForm_GetFormSummary]                                                                  
 @CandidateID BIGINT,      
 @UserLoginID VARCHAR(50),      
 @PageCode VARCHAR(50)      
AS      
SET NOCOUNT ON      
DECLARE       
 @FormStatus CHAR(1) = 'I',      
 @IsPersonalDetailsFilled BIT = 1,      
 @IsAddressDetailsFilled BIT = 1,      
 @IsCategoryAndOtherReservationDetailsFilled BIT = 1,      
 @IsQualificationDetailsFilled BIT = 1,      
 @IsAppliedForColleges BIT = 1,      
 @IsPhotoAndSignUploaded BIT = 1,      
 @IsAllCompulsoryDocumentsUploaded BIT = 1,      
 @IsApplicationFeePaid BIT = 1,      
 @IsEligible BIT = 0,      
 @ErrMsg VARCHAR(MAX) = '',      
 @IsInnerProcOk BIT = 0,      
 @IsSportsDetailsFilled BIT =1,                                      
 /*After LogLive*/                          
 @CasteCertificateNo  AS VARCHAR(100),      
 @PreviousCategory  AS VARCHAR(100),      
 @LoginID VARCHAR(50),      
 @IPAddress VARCHAR(50),      
 @WeightageID INT,      
 @IsOk BIT      
      
BEGIN      
      
 SET @PreviousCategory=''      
 SET @CasteCertificateNo=''      
       
      
 /*After LogLive*/                          
                          
 SELECT @FormStatus = FormStatus FROM ApplicationForm_Status (NOLOCK) WHERE CandidateID = @CandidateID                                                                  
                                                                   
 IF(@FormStatus NOT IN ('A', 'W'))                                                  
  BEGIN                                                                  
   EXEC ApplicationForm_SetRequiredDocuments @CandidateID, @UserLoginID, 'ApplicationFormSummary', '', @IsInnerProcOk OUTPUT                                                  
   --EXEC ApplicationForm_SaveWeightage @CandidateID,@UserLoginID,'SYSTEM',@PageCode                                              
  END                                                                   
       
       
-- Weightage Calculation ---      
 IF(@FormStatus NOT IN ('A', 'W'))      
 BEGIN      
  DECLARE CUR CURSOR      
  FOR SELECT CandidateID,CreatedBy,CreatedByIPAddress,WeightageID from ApplicationForm_NAASPaperDetails WHERE CandidateID = @CandidateID      
      
  OPEN CUR      
  FETCH NEXT FROM CUR INTO @CandidateID,@LoginID,@IPAddress,@WeightageID      
  WHILE @@FETCH_STATUS = 0      
  BEGIN      
   EXEC [ApplicationForm_SaveWeightage] @CandidateID,@LoginID,@IPAddress,@WeightageID,@IsOk OUTPUT      
      
   --SELECT @IsOk      
      
   FETCH NEXT FROM CUR INTO @CandidateID,@LoginID,@IPAddress,@WeightageID      
  END      
  CLOSE CUR      
  DEALLOCATE CUR      
 END      
----------------------------------------------------------------      
      
 -- Eligibility                                                                   
                                                                   
 SELECT      
  @IsPersonalDetailsFilled = IsPersonalDetailsFilled,      
  @IsAddressDetailsFilled = IsAddressDetailsFilled,      
  @IsCategoryAndOtherReservationDetailsFilled = IsCategoryAndOtherReservationDetailsFilled,      
  @IsQualificationDetailsFilled = IsQualificationDetailsFilled,      
  @IsAppliedForColleges = IsAppliedForColleges,      
  @IsPhotoAndSignUploaded = IsPhotoAndSignUploaded,      
  @IsSportsDetailsFilled = IsSportsDetailsFilled,      
  @IsAllCompulsoryDocumentsUploaded = IsAllCompulsoryDocumentsUploaded,      
  @IsApplicationFeePaid = IsApplicationFeePaid,      
  @IsEligible = IsFinalEligible,      
  @ErrMsg = Reason      
 FROM  dbo.fnCheckCandidateFinalEligiblity(@CandidateID)                                                             
                                                                    
 -- Application Status                                                                    
                              
 SELECT                                                                  
  CandidateID = A.CandidateID,      
  IsPersonalDetailsFilled = @IsPersonalDetailsFilled,      
IsAddressDetailsFilled = @IsAddressDetailsFilled,      
  IsCategoryAndOtherReservationDetailsFilled = @IsCategoryAndOtherReservationDetailsFilled,      
  IsQualificationDetailsFilled = @IsQualificationDetailsFilled,      
  IsAppliedForColleges = @IsAppliedForColleges,      
  IsPhotoAndSignUploaded = @IsPhotoAndSignUploaded,      
  IsSportsDetailsFilled = @IsSportsDetailsFilled,      
  IsAllCompulsoryDocumentsUploaded = @IsAllCompulsoryDocumentsUploaded,      
  IsApplicationFeePaid = @IsApplicationFeePaid,      
  IsEligible = @IsEligible,      
  ErrorMsg = @ErrMsg,      
  VersionNo = A.VersionNo,      
  StepID = A.StepID,      
  FormStatus = CASE FormStatus WHEN 'I' THEN 'Incomplete' WHEN 'C' THEN 'Complete | Not Locked' WHEN 'A' THEN 'Locked' END,      
  LastModifiedOn = ISNULL(FORMAT(A.LastModifiedOn, 'dd/MM/yyyy hh:mm:ss tt'), ''),      
  LastModifiedBy = A.LastModifiedBy,      
  LastModifiedByIPAddress = A.LastModifiedByIPAddress,      
  LastModifiedPage = A.LastModifiedPage,      
  ConfirmedOn = ISNULL(FORMAT(B.ConfirmedDateTime, 'dd/MM/yyyy hh:mm:ss tt'), ''),      
  ConfirmedBy = ISNULL(B.ConfirmedBy, ''),      
  ConfirmedByIPAddress = ISNULL(B.ConfirmedByIPAddress, ''),      
  PrintedOn = ISNULL(FORMAT(dbo.fnGetISTDateTime(), 'dd/MM/yyyy hh:mm:ss tt'), ''),      
  Date = ISNULL(FORMAT(dbo.fnGetISTDateTime(), 'dd/MM/yyyy'), '')       
 FROM ApplicationForm_Status (NOLOCK) A      
 LEFT OUTER JOIN ApplicationForm_ConfirmationDetails (NOLOCK) B ON A.CandidateID = B.CandidateID AND B.IsConfirmed = 1      
 WHERE A.CandidateID = @CandidateID      
       
 -- Personal Details                
                                                                    
 SELECT      
  CandidateID   = A.CandidateID,      
  ApplicationID  = A.ApplicationID,      
  --AppliedCourse  = B.Course + ' (MEDIUM : ' + C.Medium + ', DURATION : ' + CAST(B.Duration AS VARCHAR) + (CASE WHEN B.Duration > 1 THEN ' YEARS' ELSE ' YEAR' END) + ')',      
  CandidateName = ISNULL(Master_Saluation.Saluation,'') +' ' +  A.CandidateName,      
  FatherName = A.FatherName,      
  --MotherName = A.MotherName,      
  Gender = D.Gender,      
  DOB = CONVERT(VARCHAR, A.DOB, 103),      
  Age = 'Y-' + CAST(E.Years AS VARCHAR) + ', M-' + FORMAT(E.Months, '00') + ', D-' + FORMAT(E.Days, '00') + ' (As on 01/07/2025)',      
  MobileNo = A.MobileNo,      
  MobileNo1 = A.MobileNo1,      
  EMailID = A.EMailID,      
  ISNULL(A.MotherMaidanName,'') AS MotherMaidanName,      
  ISNULL(A.MotherPresentName,'') AS MotherPresentName,      
  ISNULL(A.FathersOccupation,'')  AS FathersOccupation,      
  ApplicationFormNo  = A.ApplicationFormNo      
 FROM ApplicationForm_RegistrationDetails (NOLOCK) A      
 INNER JOIN Master_Gender (NOLOCK) D ON A.GenderCode = D.GenderCode      
 INNER JOIN Master_Saluation  ON Master_Saluation.SaluationID=A.SaluationID      
 CROSS APPLY dbo.fnCalculateAge(A.DOB, '2025-07-01') E      
 WHERE A.CandidateID = @CandidateID      
       
 -- Address Details      
       
 SELECT       
  CandidateID  = A.CandidateID,      
  AddressLine1 = A.AddressLine1,      
  AddressLine2 = A.AddressLine2,      
  State = B.State,      
  District = C.District,      
  City = A.City,      
  Pincode = A.Pincode,      
  Taluka=CASE A.TalukaID WHEN 999 THEN A.Taluka ELSE T.Taluka END      
 FROM ApplicationForm_AddressDetails (NOLOCK) A      
 INNER JOIN Master_State (NOLOCK) B ON A.StateID = B.StateID      
 INNER JOIN Master_District (NOLock) C ON A.DistrictID = C.DistrictID AND CandidateID = @CandidateID       
 LEFT JOIN Master_Taluka T ON A.TalukaID=T.TalukaID      
       
 /*After LogLive*/      
 SELECT @CasteCertificateNo=ISNULL(DocumentNo,'') FROM  ApplicationForm_DocumentDetails WHERE DocumentID=5 AND CandidateID = @CandidateID      
 /*After LogLive*/      
                         
 /*After LogLive*/      
 SELECT @PreviousCategory =ISNULL(C.CategoryCode,'')  FROM ApplicationForm_CategoryAndOtherReservationDetails (NOLOCK) A      
 INNER JOIN Master_Category (NOLOCK) C ON A.PreviousCategoryID = C.CategoryID   AND A.CandidateID=@CandidateID                                 
                        
 /*After LogLive*/                               
 -- Category & Other Reservation Details                                                                                                     
 SELECT                                         
 CandidateID = A.CandidateID,      
 CategoryID = A.CategoryID,      
 Category = C.CategoryCode,      
 --FinalCategoryID = A.FinalCategoryID,/*After Final Merit List*/       
 FinalCategoryID = ISNULL(A.VerifiedCategoryID,0)/*After Final Merit List*/,      
 FinalCategory = ISNULL(D.CategoryCode,'--'),      
 Caste = A.Caste,      
 HasCasteCertificate = CASE A.HasCasteCertificate WHEN 1 THEN 'YES' ELSE 'NO' END,      
 HasCasteValidityReceipt = CASE A.HasCasteValidityReceipt WHEN 1 THEN 'YES' ELSE 'NO' END,      
 HasNCLCertificate = CASE A.HasNCLCertificate WHEN 1 THEN 'YES' ELSE 'NO' END,      
 HasEWSCertificate = CASE A.HasEWSCertificate WHEN 1 THEN 'YES' ELSE 'NO' END,      
 IsOrphan = CASE WHEN A.IsOrphan=1 AND A.Domicile='M' THEN 'YES' ELSE 'NO' END,      
 --IsPWD = CASE A.IsPWD WHEN 1 THEN 'YES' ELSE 'NO' END,      
 IsPWD = CASE WHEN A.IsPWD=1 AND A.Domicile='M' THEN 'YES' ELSE 'NO' END,      
 --IsExServiceman = CASE A.IsExServiceman WHEN 1 THEN 'YES' ELSE 'NO' END,      
 IsExServiceman = CASE WHEN A.IsExServiceman=1 AND A.Domicile='M' THEN 'YES' ELSE 'NO' END,      
 -- IsFreedomFighter = CASE A.IsFreedomFighter WHEN 1 THEN 'YES' ELSE 'NO' END,      
 IsFreedomFighter = CASE WHEN A.IsFreedomFighter=1 AND A.Domicile='M' THEN 'YES' ELSE 'NO' END,      
 --IsProjectAffected = CASE A.IsProjectAffected WHEN 1 THEN 'YES' ELSE 'NO' END,      
 IsProjectAffected = CASE WHEN A.IsProjectAffected=1 AND A.Domicile='M' THEN 'YES' ELSE 'NO' END,      
 --IsIncomeSourceAgriculture = CASE A.IsIncomeSourceAgriculture WHEN 1 THEN 'YES' ELSE 'NO' END,      
 IsIncomeSourceAgriculture = CASE WHEN A.IsIncomeSourceAgriculture=1 AND A.Domicile='M' THEN 'YES' ELSE 'NO' END,   
 HasCasteValidity = CASE A.HasCasteValidity WHEN 1 THEN 'YES' ELSE 'NO' END,      
  HasCasteValidityReceipt = CASE A.HasCasteValidityReceipt WHEN 1 THEN 'YES' ELSE 'NO' END,   
 R.Religion,      
 Domicile=CASE A.Domicile WHEN 'M' THEN 'MAHARASHTRA' WHEN 'O' THEN 'Outside Maharashtra' ELSE '' END,     
 A.DomicileType AS DomicileType ,      
 @CasteCertificateNo AS CasteCertificateNo,      
 @PreviousCategory AS PreviousCategory      
 FROM  ApplicationForm_CategoryAndOtherReservationDetails (NOLOCK) A      
 INNER JOIN Master_Category (NOLOCK) C ON A.CategoryID = C.CategoryID      
 INNER JOIN Master_Religion (NOLOCK) R ON A.ReligionID=R.ReligionID      
 --INNER JOIN Master_DomicileType (NOLOCK) DT ON A.DomicileType= DT.DomicileTypeID      
 LEFT JOIN Master_Category (NOLOCK) D ON A.VerifiedCategoryID = D.CategoryID   /*After Final Merit List*/      
 WHERE A.CandidateID = @CandidateID      
       
 -- Qualification Details                                                                  
                                                                  
 SELECT       
  CandidateID = A.CandidateID,      
  ISNULL(CollegeName,'') AS CollegeName,      
  ISNULL(CollegeCity,'') AS CollegeCity,      
  ISNULL(CollegePinCode,'') AS CollegePinCode,      
  ISNULL(NoOfYearsToComplete,0) AS NoOfYearsToComplete,      
  AreYouEmployed= CASE D.AreYouEmployed WHEN 1 THEN 'YES' ELSE 'NO' END,      
  ISNULL(CGPAScore,0) AS CGPAScore,      
  ISNULL(MF.FacultyName,0) AS Faculty,      
  ISNULL(Master_PGSubject.PGSubjectName,0) AS SubjectName,      
  State, F.District AS District,      
  --Q.Qualification AS QualifyingDegree,      
  ISNULL(Master_Qualification.Qualification,'') AS QualifyingDegree,      
  Taluka=CASE WHEN D.CollegeTalukaID=999 THEN D.CollegeTaluka ELSE T.Taluka END      
 FROM ApplicationForm_RegistrationDetails (NOLOCK) A       
 INNER JOIN ApplicationForm_QualificationDetails (NOLOCK) D ON A.CandidateID = D.CandidateID AND A.CandidateID = @CandidateID      
 LEFT JOIN Master_Taluka T ON D.CollegeTalukaID =T.TalukaID       
 INNER JOIN Master_State (NOLOCK) S ON D.CollegeStateID = S.StateID       
 INNER JOIN Master_District (NOLOCK) F ON D.CollegeDistrictID = F.DistrictID       
 INNER JOIN Master_Qualification ON Master_Qualification.QualificationID=D.DegreeID       
 INNER JOIN Master_Faculty MF ON MF.FacultyID=D.FacultyID       
 INNER JOIN Master_PGSubject ON Master_PGSubject.FacultyID = D.FacultyID       
 AND Master_PGSubject.PGSubjectID = D.SubjectID      
      
 -- Applied for Colleges Details                                                                  
                                                                  
 SELECT      
  CandidateID  = A.CandidateID,      
  PreferenceNo = A.PreferenceNo,      
  CollegeID   = B.CollegeID,      
  CollegeCode  = B.CollegeCode,      
  CollegeName  = B.CollegeName,      
  District   = B.District,      
  FacultyName =B.FacultyName,      
  SubjectName =B.SubjectName                    
 FROM ApplicationForm_AppliedCollegeDetails (NOLOCK) A      
 INNER JOIN ViewAgriCollegeInformation (NOLOCK) B ON A.CollegeID = B.CollegeID      
 WHERE A.CandidateID = @CandidateID AND A.PreferenceNo > 0       
 ORDER BY A.PreferenceNo      
       
 -- Photo & Sign Details                                                                  
                                                                  
 SELECT      
  CandidateID    = CandidateID,      
  PhotoUploadedURL = PhotoUploadedURL,      
  SignUploadedURL  = SignUploadedURL      
 FROM       
  ApplicationForm_PhotoAndSignDetails (NOLOCK)      
 WHERE CandidateID = @CandidateID       
       
 -- Document Details                                                                  
                                               
 SELECT      
  CandidateID = A.CandidateID,      
  DocumentID = A.DocumentID,      
   DocumentName = CASE WHEN B.IsCompulsory = 1   
                    THEN '<font color=red><b>* </b></font>' + B.Document   
                    ELSE B.Document   
               END  
+ CASE   
      WHEN A.DocumentID = 43 AND A.DocumentIssueDate IS NOT NULL THEN   
           ' (Application Receipt Number : ' + A.DocumentNo  
           + ', Application Receipt Date : ' + ISNULL(FORMAT(A.DocumentIssueDate, 'dd/MM/yyyy'), '')   
           + ', District Applied : ' + ISNULL(A.DocumentValidityReceiptDistrict, '') + ')'   
      WHEN A.DocumentIssueDate IS NOT NULL THEN    
           ' (Certificate No. : ' + A.DocumentNo   
           + ', Issue Date : ' + ISNULL(FORMAT(A.DocumentIssueDate, 'dd/MM/yyyy'), '')   
           + ')'   
      ELSE ''   
  END COLLATE SQL_Latin1_General_CP1_CI_AS,                        
  IsDocumentCompulsory = CASE B.IsCompulsory WHEN 1 THEN 'YES' ELSE 'NO' END,      
  IsDocumentUploaded = CASE A.IsDocumentUploaded WHEN 1 THEN 'YES' ELSE 'NO' END,      
  DocumentUploadedURL = A.DocumentUploadedURL,      
  --DocumentVerificationStatus = CASE A.IsVerified WHEN 1 THEN CASE WHEN A.VerificationStatus = 'Y' THEN 'Verified' ELSE 'Not Verified' END ELSE 'Pending' END,      
  DocumentVerificationStatus =       
    CASE       
        WHEN A.IsVerified = 1 THEN       
            CASE       
                WHEN A.VerificationStatus = 'Y' THEN 'Verified'       
                WHEN A.VerificationStatus = 'N' THEN 'Not Verified'       
                WHEN A.VerificationStatus = 'H' THEN 'Hold'       
                ELSE 'Unknown Status'       
            END       
        ELSE 'Pending'       
    END,      
  DocumentVerificationComments = A.VerificationComments,      
  DocumentVerificationDate = CASE A.IsVerified WHEN 1 THEN ISNULL(CONVERT(VARCHAR, A.VerifiedDateTime, 103), '--') ELSE '--' END      
 FROM ApplicationForm_DocumentDetails (NOLOCK) A       
 INNER JOIN Master_Document (NOLOCK) B ON A.DocumentID = B.DocumentID      
 WHERE A.CandidateID = @CandidateID ORDER BY B.SeqNo      
       
 -- Application Fee Payment Details                                                                  
                                                                    
 SELECT      
  CandidateID = PayeeID,      
  TransactionID   = TransactionID,      
  FeeAmount = CAST(FeeAmount AS NUMERIC(15, 2)),      
  TransactionDate  = FORMAT(TransactionDate, 'dd MMM, yyyy hh:mm:ss tt'),      
  PaymentDate   = ISNULL(FORMAT(PaymentDate, 'dd MMM, yyyy hh:mm:ss tt'), ''),       
  BankReferenceNo = ISNULL(BankReferenceNo, ''),      
  Purpose     = ISNULL(Purpose, ''),       
  PaidStatus    = CASE WHEN ISNULL(IsPaid, 0) = 1 THEN 'Paid' ELSE 'Not Paid' END                                                     
 FROM Fee_TransactionDetails (NOLOCK)       
 WHERE PayeeID = @CandidateID AND IsPaid = 1 AND PhaseID = 99 AND       
 ISNULL(IsRefundInitiated, 0) = 0 AND ISNULL(IsRefunded, 0) = 0 AND ISNULL(IsChargeBackAccepted, 0) = 0      
       
--Faculty Details      
 SELECT UserID AS CandidateID,SeatNo,FacultyName,CETScore      
 FROM Master_User  (NOLOCK)      
 JOIN Master_candidateResult (NOLOCK)   ON Master_User.UserLoginID=Master_candidateResult.ApplicationFormNo       
  AND  UserID=@CandidateID AND UserTypeID=91      
 JOIN Master_Faculty (NOLOCK)   ON Master_candidateResult.FacultyID=Master_Faculty.FacultyID AND Master_Faculty.IsActive=1      
      
--Research Paper      
 SELECT      
  ApplicationForm_NAASPaperDetails.CandidateID,      
  ApplicationForm_NAASPaperDetails.PaperTitle,      
  ApplicationForm_NAASPaperDetails.NameOfPaper,      
  ApplicationForm_NAASPaperDetails.YearOfPublication,      
  ApplicationForm_NAASPaperDetails.NAASScore,      
  ApplicationForm_NAASPaperDetails.NAASDetailID,      
  0.05 AS Weightages      
 FROM ApplicationForm_NAASPaperDetails WITH (NOLOCK)      
 WHERE ApplicationForm_NAASPaperDetails.CandidateID = @CandidateID;      
                                    
--Weightage       
      
WITH WeightageData AS (                                                
    SELECT                                                 
        Master_Weightage.WeightageDescription,                                          
        ApplicationForm_Weightage.Weightage                                                
    FROM                                                 
        ApplicationForm_Weightage                                                
    JOIN                                                 
        Master_Weightage                                                 
    ON                                                 
        ApplicationForm_Weightage.WeightageID = Master_Weightage.WeightageID                                                 
    WHERE                                                 
        ApplicationForm_Weightage.CandidateID = @CandidateID                                                
),                                                
TotalWeightage AS (                                                
    SELECT                                              
        'Total Weightage (Before Capping)' AS WeightageDescription,                               
        SUM(ApplicationForm_Weightage.Weightage) AS Weightage                                                
    FROM                                                 
        ApplicationForm_Weightage                                                
    WHERE                                                 
        ApplicationForm_Weightage.CandidateID = @CandidateID                                                
),                                                
CappedWeightage AS (                                                
    SELECT                                                 
        'Total Weightage (After Capping)' AS WeightageDescription,                                                
        CASE                                                 
            WHEN SUM(ApplicationForm_Weightage.Weightage) > 0.25 THEN 0.25                                                
            ELSE SUM(ApplicationForm_Weightage.Weightage)                                                
        END AS Weightage                                
    FROM                                                 
        ApplicationForm_Weightage                                                
    WHERE                                                 
        ApplicationForm_Weightage.CandidateID = @CandidateID                                                
)                                                
SELECT * FROM WeightageData                                          
                                          
UNION ALL                                
                                          
-- Include Total Weightage (Before Capping) only if there are records                                          
SELECT * FROM TotalWeightage                                        
WHERE EXISTS (SELECT 1 FROM ApplicationForm_Weightage WHERE CandidateID = @CandidateID)                                          
                                          
UNION ALL                                          
                                          
-- Include Total Weightage (After Capping) only if there are records                                          
SELECT * FROM CappedWeightage                                          
WHERE EXISTS (SELECT 1 FROM ApplicationForm_Weightage WHERE CandidateID = @CandidateID);                                    
                                    
                                    
--FacultyEligibilityDetails                                    
                              
SELECT Master_Faculty.FacultyName,CETScore,                                
CET70Per,CGPAScore,CGPA30Per,TotalScore,CETScore,                                  
 Weightage=ISNULL(Weightage,0),CappedWeightage=ISNULL(CappedWeightage,0),TotalProvisinalScore=ISNULL(TotalProvisinalScore,0),                                     
 Eligible=CASE WHEN IsEligible=1 THEN 'Eligible' ELSE 'Not Eligible' END,                                    
 EligibilityDescription ,Master_FacultyWiseSubjects.SubjectName                 
FROM ApplicationForm_FacultyWiseEligibility                                    
JOIN Master_Faculty ON ApplicationForm_FacultyWiseEligibility.FacultyID=Master_Faculty.FacultyID                                     
AND ApplicationForm_FacultyWiseEligibility.CandidateID=@CandidateID             
JOIN Master_FacultyWiseSubjects ON Master_FacultyWiseSubjects.FacultyID = ApplicationForm_FacultyWiseEligibility.FacultyID              
AND Master_FacultyWiseSubjects.SubjectID = ApplicationForm_FacultyWiseEligibility.SubjectID       
      
      
END 
