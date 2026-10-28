CREATE PROCEDURE [dbo].[ApplicationForm_GetCategoryAndOtherReservationDetails]                
 @CandidateID BIGINT,                
 @UserLoginID VARCHAR(50),                        
 @PageCode VARCHAR(50)                
AS               
BEGIN    
 SELECT                 
  CandidateID,                
  Domicile,DomicileType,ReligionID,              
   CategoryID, FinalCategoryID, Caste,                
  HasCasteCertificate, HasNCLCertificate, HasEWSCertificate, IsOrphan, IsPWD,                 
  IsExServiceman, IsFreedomFighter, IsProjectAffected,      
   IsIncomeSourceAgriculture, HasCasteValidity,HasCasteValidityReceipt=ISNULL(HasCasteValidityReceipt,0),  
   PreviousCategoryID=ISNULL(PreviousCategoryID,0)  
 FROM                 
  ApplicationForm_CategoryAndOtherReservationDetails (NOLOCK)                 
 WHERE                 
  CandidateID = @CandidateID     
END  
