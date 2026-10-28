CREATE    PROCEDURE [dbo].[SpotRound_DynamicVac]       
   
 @UniversityID TINYINT,      
 @SubjectID  SMALLINT      
AS      
SET NOCOUNT ON      
BEGIN      
      
  
 SELECT      
      V.SubjectID,FS.SubjectName,V.Quota,V.Category,V.GenderType,V.AllottedType,V.Vac       
 FROM VW_SpotRound_CollegeWiseVac V --INNER JOIN Master_PHDCollegeCode S ON V.SubjectID = S.SubjectID  
 INNER JOIN Master_FacultyWiseSubjects FS ON FS.SubjectID = V.SubjectID  
 --INNER JOIN Master_College MC ON MC.CollegeCode = S.CollegeCode      
 WHERE V.UniversityID = @UniversityID and V.SubjectID = @SubjectID  and v.Vac > 0      
 
      
 SELECT    
  V.CollegeCode,C.CollegeName,PHDCollegeCode,V.Quota,SubjectName,Vac       
 FROM VW_SpotRound_SubjectWiseVac V INNER JOIN Master_College C ON V.CollegeCode = C.CollegeCode      
 WHERE V.CollegeUniversityID = @UniversityID AND RIGHT(V.PHDCollegeCode,2) = @SubjectID AND V.Vac > 0 -- AND V.IsActive=1    
   
 SELECT RosterSrNo,RosterPoints,CategoryName,Vac FROM VW_SpotRound_RosterVac  V     
	 WHERE V.SubjectID = @SubjectID AND v.UniversityID = @UniversityID AND Vac > 0   
      
END      


