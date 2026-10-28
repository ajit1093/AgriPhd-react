

CREATE     PROCEDURE [dbo].[SpotRound_GetAllotmentLetter] -- [SpotRound_GetAllotmentLetter] 3,'MCAER-PHD2500182'                  
 @PhaseID SMALLINT,                                          
 @ApplicationFormNo VARCHAR(16)                                          

AS
SET NOCOUNT ON

DECLARE 
	@IsEligible SMALLINT,
	@AdmissionStartDate DATETIME, 
	@AdmissionEndDate DATETIME,
	@ErrMsg VARCHAR(250) = '',
	@CandidateID BIGINT

BEGIN                                
            
	SELECT @CandidateID = CandidateID FROM ApplicationForm_RegistrationDetails (NOLOCK) WHERE ApplicationFormNo = @ApplicationFormNo
    
	SELECT @AdmissionStartDate = AllotmentDisplayStartDate, @AdmissionEndDate = SystemAdmissionLastDate FROM Master_Phase (NOLOCK) WHERE PhaseID = @PhaseID AND IsActive = 1          
          
	IF ((@AdmissionStartDate IS NULL OR @AdmissionStartDate > dbo.fnGetISTDateTime()) )
	BEGIN
		SET @IsEligible = 0
		SET @ErrMsg = 'Downloading Allotment Letter is Not Started for this Phase.'
	END                          
	ELSE IF ((@AdmissionEndDate IS NULL OR @AdmissionEndDate < dbo.fnGetISTDateTime()))
	BEGIN
		SET @IsEligible = 0
		SET @ErrMsg = 'Downloading Allotment Letter is Closed for this Phase.'
	END
	ELSE
	BEGIN
		SET @IsEligible = 1
		SET @ErrMsg =''
	END
    /****After Admission Code Go Live*/          
          
	SELECT
		CandidateID       = A.CandidateID,
		ApplicationID      = A.ApplicationID,
		/*AppliedCourse      = A.AppliedCourse,   */
		CandidateName      = ISNULL(SAL.Saluation,'') + ' ' + A.CandidateName,
		FatherName        = A.FatherName,         
		MotherName        = A.MotherPresentName,  
		ApplicationFormNo = A.ApplicationFormNo,
		MobileNo = A.MobileNo,          
		EMailID = A.EMailID,     
		FacultyName = E.FacultyName,    
		SubjectName = E.SubjectName,
		Gender        = B.Gender,    
		DOB         = FORMAT(A.DOB,'dd MMM, yyyy'),     
		Category       =   C.StudentCategoryDisplay,
		VerifiedCategory=F.CategoryCode,
		/*DomicileDistrict     = A.DomicileDistrict,  */                     
		PhotoURL       = P.PhotoUploadedURL,          
		SignURL        = P.SignUploadedURL,       
		AcademicWeightage     = Q.CGPAScore,                  
		/*[7/12Weightage]      = C.[7/12Weightage],  */        
		/*NCCWeightage      = C.NCCWeightage, 
		SportWeightage      = C.SportWeightage,  
		/MPKVEmployeeWeightage    = C.MPKVEmployeeWeightage,/
		TotalWeightage      = C.TotalWeightage,*/    
		MeritNo        = C.MeritNo,
		AllotmentPhaseID     = D.PhaseID,
		AllotmentPhase      = D.Phase,
		AllottedCollegeID   = E.CollegeID,
		--AllottedCollegeCode     = E.CollegeCode,
		AllottedCollegeCode     = C.ChoiceCode,
		AllottedCollege      = E.CollegeName,
		AllottedCollegeDistrictID   = E.DistrictID,
		AllottedCollegeDistrict    = E.District,
		AllotedCollegeAddress = E.CollegeAddress , /* ',' + ISNULL(E.City,'') ,      */
		AllottedPreferenceNo    = C.AllottedPreferenceNo,  
		/*AllottedCategory     = G.Category,            */
		AllottedCategory     = C.AllottedCategoryDisplay,
		AllottedQuota = C.AllottedQuota,
		SubjectCode = C.PHDCollegeCode,
		C.RosterSeqNo AS RoasterSeqNo,
		C.RoasterPoint as RoasterPoint,
		ISNULL(C.RoasterCategory,'') as RoasterCategory,
		ISNULL(C.AllottedGender,'') AS AllotedGender,
		AllottedTypeDisplay     = C.AllottedTypeDisplay, 
		AllotmentDate      = FORMAT(C.AllotmentDate,'dd-MMM-yyyy'),
		SpotRoundDate      = FORMAT(D.AdmissionStartDate,'dd-MMM-yyyy'),
		AdmissionSchedule     = CASE WHEN D.AdmissionStartDate IS NOT NULL AND D.CandidateAdmissionLastDate IS NOT NULL THEN FORMAT(D.AdmissionStartDate,'dd MMM, yyyy hh:mm:ss tt') + ' To ' + FORMAT(D.CandidateAdmissionLastDate,'dd MMM, yyyy hh:mm:ss tt') ELSE


								'' END,
		CandidateAdmissionLastDate   = ISNULL(FORMAT(D.CandidateAdmissionLastDate, 'dd MMM, yyyy hh:mm:ss tt'), ''),                        
		IsAllotmentLetterDownloaded   = CASE C.SeatAcceptanceStatus WHEN 'Y' THEN 1 ELSE 0 END,             
		AllotmentLetterDownloadedOn   = CASE C.SeatAcceptanceStatus WHEN 'Y' THEN ISNULL(FORMAT(C.SeatAcceptedDateTime,'dd MMM, yyyy hh:mm:ss tt'), '--') ELSE '--' END,                                    
		IsEligibleToDownloadAllotmentLetter = CASE WHEN D.IsCurrentPhase = 1 AND D.AllotmentDisplayStartDate IS NOT NULL AND D.CandidateAdmissionLastDate IS NOT NULL AND dbo.fnGetISTDateTime() BETWEEN D.AllotmentDisplayStartDate AND D.CandidateAdmissionLastDate

												THEN 1 ELSE 0 END,      
		--IsRefusalFeePaid     = CASE WHEN H.RemainingFee <= 0 THEN 1 ELSE 0 END,  
		--RefusalRemainingFee     = H.RemainingFee ,
		ApplicationFormNo = A.ApplicationFormNo,
		IsRefused = C.IsRefused,
		IsAccepted = C.IsAccepted,
		IsPWD = CASE WHEN  T.IsPWD = 1 THEN 'YES' ELSE 'NO' END,
		IsOrphan = CASE WHEN  T.IsOrphan = 1 THEN 'YES' ELSE 'NO' END,
		AllottedNodalOfficerName =  E.NodalOfficerName,   AllottedNodalOfficerMobileNo=E.NodalOfficerContactNo,   AllottedNodalOfficerEMailID=E.NodalOfficerEmail,                              
		CollegeUniversity= U.UniversityName,
		CandidateHomeUniversity=STUDUniv.UniversityName,
		GraduationFaculty=GraduationFaculty.FacultyName,
		GraduationSubject=  V.QualificationSubject,
		E.DegreeName AS DegreeName ,
		C.ReportingStatus as ReportingStatus,
		ISNULL(C.RefusalReason,'') AS RefusalReason,
		@IsEligible as IsEligible,@ErrMsg as ErrorText
	FROM
		/*VW_CandidateData (NOLOCK) A  */
		ApplicationForm_RegistrationDetails (NOLOCK) A
		INNER JOIN Master_Gender (NOLOCK) B ON A.GenderCode = B.GenderCode
		INNER JOIN College_AllotmentDetails (NOLOCK) C ON A.CandidateID = C.CandidateID
		INNER JOIN Master_Phase (NOLOCK) D ON C.PhaseID = D.PhaseID
		--INNER JOIN ViewAgriCollegeInformation (NOLOCK) E ON C.ChoiceCode = E.CollegeCode
		INNER JOIN ViewAgriCollegeInformation (NOLOCK) E ON C.PHDCollegeCode = E.CollegeCode
		INNER JOIN ApplicationForm_CategoryAndOtherReservationDetails T ON T.CandidateID=A.CandidateID  
		/*INNER JOIN Master_Category (NOLOCK) F ON T.FinalCategoryID = F.CategoryID*/
		INNER JOIN Master_Category (NOLOCK) F ON C.StudentCategoryID = F.CategoryID
		/*INNER JOIN Master_Category (NOLOCK) G ON C.AllottedCategoryID = G.CategoryID*/
		INNER JOIN ApplicationForm_PhotoAndSignDetails (NOLOCK) P ON P.CandidateID=A.CandidateID
		INNER JOIN ApplicationForm_QualificationDetails (NOLOCK) Q ON Q.CandidateID=A.CandidateID
		INNER JOIN Master_Saluation (NOLOCK) SAL ON  SAL.SaluationID=A.SaluationID
		INNER JOIN Master_University (NOLOCK) U ON U.UniversityID=E.CollegeUniversityID
		INNER JOIN Master_University (NOLOCK) STUDUniv ON C.StudentUniID=STUDUniv.UniversityID
		INNER JOIN Master_Faculty GraduationFaculty (NOLOCK) ON GraduationFaculty.FacultyID=Q.FacultyID
		INNER JOIN VW_CandidateAllData V ON V.CandidateID = A.CandidateID
		--CROSS APPLY dbo.fnCalculateFee(A.CandidateID,@PhaseID) H 
	WHERE
		C.PhaseID = @PhaseID AND A.CandidateID = @CandidateID
                                         
                                        
/* SELECT                                          
  CandidateID  = PayeeID,                                          
  TransactionID = TransactionID,                                            
  FeeAmount  = CAST(FeeAmount AS NUMERIC(15, 2)),                                            
  TransactionDate = FORMAT(TransactionDate, 'dd MMM, yyyy hh:mm:ss tt'),                         
  PaymentDate  = ISNULL(FORMAT(PaymentDate, 'dd MMM, yyyy hh:mm:ss tt'), ''),                                             
  BankReferenceNo = ISNULL(BankReferenceNo, ''),                                            
  Purpose   = ISNULL(Purpose, ''),                               
  PaidStatus  = CASE WHEN ISNULL(IsPaid, 0) = 1 THEN 'Paid' ELSE 'Not Paid' END                                            
 FROM                                             
  Fee_TransactionDetails (NOLOCK)                      
 WHERE                                            
  PhaseID = @PhaseID AND PayeeID = @CandidateID AND IsPaid = 1                                           
  AND ISNULL(IsRefundInitiated, 0) = 0 AND                                         
  ISNULL(IsRefunded, 0) = 0 AND ISNULL(IsChargeBackAccepted, 0) = 0   */                              
  END 

