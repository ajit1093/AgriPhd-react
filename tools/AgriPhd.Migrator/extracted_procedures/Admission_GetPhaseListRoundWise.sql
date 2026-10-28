  
CREATE     PROCEDURE [dbo].[Admission_GetPhaseListRoundWise]    
@CandidateID BIGINT,  
 @UserTypeID SMALLINT,      
 @Flag VARCHAR(50),      
 @UserLoginID VARCHAR(50) = ''      
AS       
 --DECLARE @CurrentPhaseID SMALLINT = 0      
 --SELECT @CurrentPhaseID = PhaseID FROM Master_Phase (NOLOCK) WHERE IsActive = 1       
       
 IF (@Flag = 'DownloadAllotmentLetterRoundwise')      
  BEGIN      
  SELECT CA.PhaseID, MP.[Phase], '' AS [Group] FROM College_AllotmentDetails AS CA  
   INNER JOIN Master_Phase AS MP ON MP.PhaseID = CA.PhaseID   
   WHERE CA.CandidateID = @CandidateID AND CA.ReportingStatus = 'Y'  
  
   --SELECT CA.PhaseID, [Phase], '' AS [Group] FROM Master_Phase   
   --INNER JOIN College_AllotmentDetails AS CA ON Master_Phase.PhaseID = CA.PhaseID   
   --WHERE IsActive = 1 AND CA.CandidateID = @CandidateID  
   --AND Master_Phase.PhaseID < @CurrentPhaseID    
     
   --UNION ALL      
   --SELECT PhaseID, [Phase], '' AS [Group] FROM Master_Phase WHERE IsActive = 1 AND PhaseID IN (SELECT PhaseID FROM Master_Phase WHERE PhaseID = @CurrentPhaseID AND AllotmentDisplayStartDate IS NOT NULL     
   --AND dbo.fnGetISTDateTime() >= AllotmentDisplayStartDate)      
  END    
    

