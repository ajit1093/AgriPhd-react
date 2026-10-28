
CREATE   PROCEDURE [dbo].[Dashboard_GetAdminDashboard]  
 @UserTypeID INT,  
 @UserLoginID VARCHAR(50)  
AS  
 SELECT  
  Registered_1  = (SELECT COUNT(1) FROM ApplicationForm_Status (NOLOCK) A INNER JOIN ApplicationForm_RegistrationDetails (NOLOCK) B ON A.CandidateID = B.CandidateID /*WHERE B.AppliedCourseID = 1*/),  
  Locked_1   = (SELECT COUNT(1) FROM ApplicationForm_Status (NOLOCK) A INNER JOIN ApplicationForm_RegistrationDetails (NOLOCK) B ON A.CandidateID = B.CandidateID WHERE /*B.AppliedCourseID = 1*/ FormStatus = 'A'),  
  FullyVerified_1  = (SELECT COUNT(1) FROM ApplicationForm_Status (NOLOCK) A INNER JOIN ApplicationForm_RegistrationDetails (NOLOCK) B ON A.CandidateID = B.CandidateID WHERE /*B.AppliedCourseID = 1*/ FormStatus = 'A' AND IsFullyEVerified = 1),  
  PartiallyVerified_1 = (SELECT COUNT(1) FROM ApplicationForm_Status (NOLOCK) A INNER JOIN ApplicationForm_RegistrationDetails (NOLOCK) B ON A.CandidateID = B.CandidateID WHERE /*B.AppliedCourseID = 1 AND*/ FormStatus = 'A' AND IsFullyEVerified = 0 AND 
  A.CandidateID IN (SELECT DISTINCT CandidateID FROM ApplicationForm_DocumentDetails (NOLOCK) WHERE IsVerified = 1)),  
  
  /*Registered_2  = (SELECT COUNT(1) FROM ApplicationForm_Status (NOLOCK) A INNER JOIN ApplicationForm_RegistrationDetails (NOLOCK) B ON A.CandidateID = B.CandidateID /*WHERE B.AppliedCourseID = 2*/),  
  Locked_2   = (SELECT COUNT(1) FROM ApplicationForm_Status (NOLOCK) A INNER JOIN ApplicationForm_RegistrationDetails (NOLOCK) B ON A.CandidateID = B.CandidateID WHERE /*B.AppliedCourseID = 2 AND*/ FormStatus = 'A'),  
  FullyVerified_2  = (SELECT COUNT(1) FROM ApplicationForm_Status (NOLOCK) A INNER JOIN ApplicationForm_RegistrationDetails (NOLOCK) B ON A.CandidateID = B.CandidateID WHERE /*B.AppliedCourseID = 2 AND*/ FormStatus = 'A' AND IsFullyEVerified = 1),  
  PartiallyVerified_2 = (SELECT COUNT(1) FROM ApplicationForm_Status (NOLOCK) A INNER JOIN ApplicationForm_RegistrationDetails (NOLOCK) B ON A.CandidateID = B.CandidateID WHERE /*B.AppliedCourseID = 2 AND*/ FormStatus = 'A' AND IsFullyEVerified = 0 AND 
  A.CandidateID IN (SELECT DISTINCT CandidateID FROM ApplicationForm_DocumentDetails (NOLOCK) WHERE IsVerified = 1)),  
  
  Registered_3  = (SELECT COUNT(1) FROM ApplicationForm_Status (NOLOCK) A INNER JOIN ApplicationForm_RegistrationDetails (NOLOCK) B ON A.CandidateID = B.CandidateID /*WHERE B.AppliedCourseID = 3*/),  
  Locked_3   = (SELECT COUNT(1) FROM ApplicationForm_Status (NOLOCK) A INNER JOIN ApplicationForm_RegistrationDetails (NOLOCK) B ON A.CandidateID = B.CandidateID WHERE /*B.AppliedCourseID = 3 AND*/ FormStatus = 'A'),  
  FullyVerified_3  = (SELECT COUNT(1) FROM ApplicationForm_Status (NOLOCK) A INNER JOIN ApplicationForm_RegistrationDetails (NOLOCK) B ON A.CandidateID = B.CandidateID WHERE /*B.AppliedCourseID = 3 AND*/ FormStatus = 'A' AND IsFullyEVerified = 1),  
  PartiallyVerified_3 = (SELECT COUNT(1) FROM ApplicationForm_Status (NOLOCK) A INNER JOIN ApplicationForm_RegistrationDetails (NOLOCK) B ON A.CandidateID = B.CandidateID WHERE /*B.AppliedCourseID = 3 AND*/ FormStatus = 'A' AND IsFullyEVerified = 0 AND 
  A.CandidateID IN (SELECT DISTINCT CandidateID FROM ApplicationForm_DocumentDetails (NOLOCK) WHERE IsVerified = 1)),  */
  
  /*NoOfColleges_1 = (SELECT COUNT(DISTINCT CollegeID) FROM ViewAgriCollegeInformation (NOLOCK) /*WHERE CourseID = 1*/),  
  Intake_1  = ISNULL((SELECT SUM(Intake) FROM ViewAgriCollegeInformation (NOLOCK) /*WHERE CourseID = 1*/), 0),  
  Admitted_1  = (SELECT COUNT(1) FROM College_AllotmentDetails (NOLOCK) A INNER JOIN ViewAgriCollegeInformation (NOLOCK) B ON A.CollegeID = B.CollegeID WHERE A.ReportingStatus = 'Y' /*AND B.CourseID = 1*/),  
  Vacancy_1  = ISNULL((SELECT SUM(Intake) FROM ViewAgriCollegeInformation (NOLOCK) /*WHERE CourseID = 1*/), 0) - (SELECT COUNT(1) FROM College_AllotmentDetails (NOLOCK) A INNER JOIN ViewAgriCollegeInformation (NOLOCK) B ON A.CollegeID = B.CollegeID WHERE 
  A.ReportingStatus = 'Y' /*AND B.CourseID = 1*/) */



  NoOfColleges_1 = (SELECT COUNT(DISTINCT CollegeCode) FROM Master_College (NOLOCK) WHERE IsActive='Y' /*WHERE CourseID = 1*/),  
  Intake_1  = ISNULL((SELECT SUM(Intake) FROM Master_College (NOLOCK) /*WHERE CourseID = 1*/ WHERE IsActive='Y'), 0),  
  Admitted_1  = (SELECT COUNT(1) FROM College_AllotmentDetails (NOLOCK) A INNER JOIN Master_College (NOLOCK) B ON A.ChoiceCode = B.CollegeCode WHERE A.ReportingStatus = 'Y' AND  IsActive='Y' /*AND B.CourseID = 1*/),  
  Vacancy_1  = ISNULL((SELECT SUM(Intake) FROM Master_College (NOLOCK) /*WHERE CourseID = 1*/), 0) - (SELECT COUNT(1) FROM College_AllotmentDetails (NOLOCK) A INNER JOIN Master_College (NOLOCK) B ON A.ChoiceCode = B.CollegeCode WHERE 
  A.ReportingStatus = 'Y' AND  B.IsActive='Y' /*AND B.CourseID = 1*/) 


  
  /*NoOfColleges_2 = (SELECT COUNT(DISTINCT CollegeID) FROM ViewAgriCollegeInformation (NOLOCK) /*WHERE CourseID = 2*/),  
  Intake_2  = ISNULL((SELECT SUM(Intake) FROM ViewAgriCollegeInformation (NOLOCK) /*WHERE CourseID = 2*/), 0),  
  Admitted_2  = (SELECT COUNT(1) FROM College_AllotmentDetails (NOLOCK) A INNER JOIN ViewAgriCollegeInformation (NOLOCK) B ON A.CollegeID = B.CollegeID WHERE A.ReportingStatus = 'Y' /*AND B.CourseID = 2*/),  
  Vacancy_2  = ISNULL((SELECT SUM(Intake) FROM ViewAgriCollegeInformation (NOLOCK) /*WHERE CourseID = 2*/), 0) - (SELECT COUNT(1) FROM College_AllotmentDetails (NOLOCK) A INNER JOIN ViewAgriCollegeInformation (NOLOCK) B ON A.CollegeID = B.CollegeID WHERE 
  A.ReportingStatus = 'Y' /*AND B.CourseID = 2*/),  
  
  NoOfColleges_3 = (SELECT COUNT(DISTINCT CollegeID) FROM ViewAgriCollegeInformation (NOLOCK) /*WHERE CourseID = 3*/),  
  Intake_3  = ISNULL((SELECT SUM(Intake) FROM ViewAgriCollegeInformation (NOLOCK) /*WHERE CourseID = 3*/), 0),  
  Admitted_3  = (SELECT COUNT(1) FROM College_AllotmentDetails (NOLOCK) A INNER JOIN ViewAgriCollegeInformation (NOLOCK) B ON A.CollegeID = B.CollegeID WHERE A.ReportingStatus = 'Y' /*AND B.CourseID = 3*/),  
  Vacancy_3  = ISNULL((SELECT SUM(Intake) FROM ViewAgriCollegeInformation (NOLOCK) /*WHERE CourseID = 3*/), 0) - (SELECT COUNT(1) FROM College_AllotmentDetails (NOLOCK) A INNER JOIN ViewAgriCollegeInformation (NOLOCK) B ON A.CollegeID = B.CollegeID WHERE 
  A.ReportingStatus = 'Y' /*AND B.CourseID = 3*/)  */

