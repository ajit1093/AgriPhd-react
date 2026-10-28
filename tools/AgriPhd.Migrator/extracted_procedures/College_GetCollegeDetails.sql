
CREATE       PROCEDURE [dbo].[College_GetCollegeDetails]
	@CollegeID BIGINT
AS
	SELECT 
		CollegeID, CollegeCode, CollegeName, CollegeAddress, DistrictID, Taluka, 
		City, Pincode, MobileNo, EMailID, CourseID, CourseStatusID, Intake, HasManagementQuota, 
		PrincipalName, PrincipalEMailID, PrincipalMobileNo, 
        AdmissionInchargeName, AdmissionInchargeEMailID, AdmissionInchargeMobileNo
	FROM
		Master_CollegeDetails (NOLOCK)
	WHERE
		CollegeID = @CollegeID

