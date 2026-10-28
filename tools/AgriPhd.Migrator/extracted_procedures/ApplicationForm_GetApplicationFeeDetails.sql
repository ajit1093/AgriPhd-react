CREATE   PROCEDURE [dbo].[ApplicationForm_GetApplicationFeeDetails]  
 @CandidateID BIGINT,  
 @UserLoginID VARCHAR(50),          
 @PageCode VARCHAR(50)  
AS  
 SELECT  
  CandidateID   = A.CandidateID,   
  ApplicationID  = A.ApplicationID,   
  CandidateName = A.CandidateName,  
  --AppliedCourse  = B.Course + ' (Medium : ' + C.Medium + ', Duration : ' + CAST(B.Duration AS VARCHAR) + (CASE WHEN B.Duration > 1 THEN ' Years' ELSE ' Year' END) + ')',      
  Gender     = D.Gender,   
  Category    = F.Category,   
  IsPWD     = CASE E.IsPWD WHEN 1 THEN 'YES' ELSE 'NO' END,  
  FeeToBePaid  = G.FeeToBePaid,   
  FeeAlreadyPaid = G.FeeAlreadyPaid,   
  RemainingFee  = G.RemainingFee,   
  LastPaymentDate = G.LastPaymentDate,   
  Purpose    = G.Purpose,  
  PhaseID    = G.PhaseID  
 FROM   
  ApplicationForm_RegistrationDetails (NOLOCK) A  
  --INNER JOIN Master_Course (NOLOCK) B ON A.AppliedCourseID = B.CourseID  
  --INNER JOIN Master_Medium (NOLOCK) C ON B.MediumID = C.MediumID  
  INNER JOIN Master_Gender (NOLOCK) D ON A.GenderCode = D.GenderCode  
  INNER JOIN ApplicationForm_CategoryAndOtherReservationDetails (NOLOCK) E ON A.CandidateID = E.CandidateID  
  INNER JOIN Master_Category (NOLOCK) F ON E.FinalCategoryID = F.CategoryID  
  CROSS APPLY dbo.fnCalculateFee(A.CandidateID, 99) G  
 WHERE   
  A.CandidateID = @CandidateID  
