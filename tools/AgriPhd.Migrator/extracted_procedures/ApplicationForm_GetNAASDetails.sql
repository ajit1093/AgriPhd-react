
    
CREATE     PROCEDURE [dbo].[ApplicationForm_GetNAASDetails]    
 @CandidateID BIGINT    
AS    
SET NOCOUNT ON    
BEGIN    
    
SELECT     
 ApplicationForm_NAASPaperDetails.PaperTitle,    
 ApplicationForm_NAASPaperDetails.NameOfPaper,    
 ApplicationForm_NAASPaperDetails.YearOfPublication,    
 ApplicationForm_NAASPaperDetails.NAASScore,    
 ApplicationForm_NAASPaperDetails.NAASDetailID, 
 0.05 AS Weightages  
FROM     
    ApplicationForm_NAASPaperDetails WITH (NOLOCK)    
WHERE    
    ApplicationForm_NAASPaperDetails.CandidateID = @CandidateID     
    
    
END 

