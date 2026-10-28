CREATE   PROCEDURE [dbo].[ApplicationForm_GetAddressDetails]    
 @CandidateID BIGINT,    
 @UserLoginID VARCHAR(50),            
 @PageCode VARCHAR(50)    
AS    
 SELECT     
  CandidateID, AddressLine1, AddressLine2, StateID, DistrictID, City,Taluka, TalukaID,Pincode    
 FROM     
  ApplicationForm_AddressDetails (NOLOCK)     
 WHERE     
  CandidateID = @CandidateID 
