  
CREATE   PROCEDURE [dbo].[Admission_GetPhaseList]  
 @UserTypeID SMALLINT,  
 @Flag VARCHAR(50),  
 @UserLoginID VARCHAR(50) = ''  
AS   
 DECLARE @CurrentPhaseID SMALLINT = 0  
 SELECT @CurrentPhaseID = PhaseID FROM Master_Phase (NOLOCK) WHERE IsActive = 1 AND IsCurrentPhase = 1  
   
 IF (@Flag = 'AllotmentDisplay')  
  BEGIN  
   SELECT PhaseID, [Phase], '' AS [Group] FROM Master_Phase WHERE IsActive = 1 AND PhaseID < @CurrentPhaseID  
   UNION ALL  
   SELECT PhaseID, [Phase], '' AS [Group] FROM Master_Phase WHERE IsActive = 1 AND PhaseID IN (SELECT PhaseID FROM Master_Phase WHERE PhaseID = @CurrentPhaseID AND AllotmentDisplayStartDate IS NOT NULL 
   AND dbo.fnGetISTDateTime() >= AllotmentDisplayStartDate)  
  END  
 ELSE IF (@Flag = 'AllotmentReport')  
  BEGIN  
   SELECT PhaseID, [Phase], '' AS [Group] FROM Master_Phase WHERE IsActive = 1 AND PhaseID < @CurrentPhaseID  
   UNION ALL  
   SELECT PhaseID, [Phase], '' AS [Group] FROM Master_Phase WHERE IsActive = 1 AND PhaseID IN (SELECT PhaseID FROM Master_Phase WHERE PhaseID = @CurrentPhaseID AND AllotmentDisplayStartDate IS NOT NULL 
   AND dbo.fnGetISTDateTime() >= AllotmentDisplayStartDate)  
  END  
 ELSE IF (@Flag = 'Admission')  
  BEGIN  
   IF (@UserTypeID IN (11, 12))  
    BEGIN  
     SELECT PhaseID, [Phase], '' AS [Group] FROM Master_Phase WHERE IsActive = 1 AND PhaseID <= @CurrentPhaseID  
    END  
   ELSE   
    BEGIN  
     SELECT PhaseID, [Phase], '' AS [Group] FROM Master_Phase WHERE IsActive = 1 AND PhaseID IN (SELECT PhaseID FROM Master_Phase WHERE PhaseID = @CurrentPhaseID AND AdmissionStartDate IS NOT NULL AND SystemAdmissionLastDate IS NOT NULL AND 
	 dbo.fnGetISTDateTime() BETWEEN AdmissionStartDate AND SystemAdmissionLastDate)  
    END  
  END  

