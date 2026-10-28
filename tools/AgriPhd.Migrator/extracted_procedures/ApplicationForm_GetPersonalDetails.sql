CREATE PROCEDURE [dbo].[ApplicationForm_GetPersonalDetails]      
 @CandidateID BIGINT,      
 @UserLoginID VARCHAR(50),              
 @PageCode VARCHAR(50)      
AS      
BEGIN
		SELECT      
			CandidateID, ApplicationID,     
			--AppliedCourseID,     
			CandidateName, FatherName,           
			GenderCode, DOB, MobileNo, EMailID,    
			ISNULL(SaluationID,'') AS SaluationID ,    
			ISNULL(MotherMaidanName,'') AS MotherMaidanName,    
			ISNULL(MotherPresentName,'') AS MotherPresentName,    
			ISNULL(FathersOccupation,'')  AS FathersOccupation    
		FROM       
			ApplicationForm_RegistrationDetails (NOLOCK)       
		WHERE       
		CandidateID = @CandidateID   
 
		--SELECT SaluationMapID,SaluationID,GenderCode FROM Master_SaluationMap (NOLOCK) where IsActive=1 ORDER BY SeqNo
 END
