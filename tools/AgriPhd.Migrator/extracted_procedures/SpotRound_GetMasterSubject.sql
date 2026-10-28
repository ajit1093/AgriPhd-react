

CREATE       PROCEDURE [dbo].[SpotRound_GetMasterSubject] -- [SpotRound_GetMasterSubject] 2  
 @UniversityID TINYINT  
AS  
 --WITH CTC AS (  
 -- SELECT DISTINCT C.SubjectID FROM Master_PHDCollegeCode C INNER JOIN Master_College MC ON MC.CollegeCode = C.CollegeCode AND MC.CollegeUniversityID = @UniversityID  
 --)  
   
   --SELECT S.SubjectID,SubjectName,FacultyID FROM Master_FacultyWiseSubjects S INNER JOIN CTC C ON S.SubjectID = C.SubjectID

   SELECT DISTINCT S.SubjectID,SubjectName,FacultyID FROM VW_SpotRound_SubjectWiseVac S WHERE S.CollegeUniversityID = @UniversityID AND
   S.Vac > 0 ORDER BY SubjectName
   
   --INNER JOIN CTC C ON S.SubjectID = C.SubjectID 
   --WHERE S.Vac > 0


