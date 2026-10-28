
CREATE     PROCEDURE [dbo].[EV_SaveDocumentsEVerificationStatus]   
-- [EV_SaveDocumentsEVerificationStatus] 100205,'<?xml version="1.0"?><ArrayOfRequiredDocumentEntity xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><RequiredDocumentEntity><CandidateID>0</CandidateID><DocumentID>23</DocumentID><IsDocumentUploaded>0</IsDocumentUploaded><DocumentIssueDate xsi:nil="true" /><IsCompulsory>0</IsCompulsory><IsVerified>1</IsVerified><VerificationStatus>Y</VerificationStatus><VerificationComments /><IsAllCompulsoryDocumentsUploaded>0</IsAllCompulsoryDocumentsUploaded></RequiredDocumentEntity><RequiredDocumentEntity><CandidateID>0</CandidateID><DocumentID>1</DocumentID><IsDocumentUploaded>0</IsDocumentUploaded><DocumentIssueDate xsi:nil="true" /><IsCompulsory>0</IsCompulsory><IsVerified>1</IsVerified><VerificationStatus>Y</VerificationStatus><VerificationComments /><IsAllCompulsoryDocumentsUploaded>0</IsAllCompulsoryDocumentsUploaded></RequiredDocumentEntity><RequiredDocumentEntity><CandidateID>0</CandidateID><DocumentID>2</DocumentID><IsDocumentUploaded>0</IsDocumentUploaded><DocumentIssueDate xsi:nil="true" /><IsCompulsory>0</IsCompulsory><IsVerified>1</IsVerified><VerificationStatus>Y</VerificationStatus><VerificationComments /><IsAllCompulsoryDocumentsUploaded>0</IsAllCompulsoryDocumentsUploaded></RequiredDocumentEntity><RequiredDocumentEntity><CandidateID>0</CandidateID><DocumentID>3</DocumentID><IsDocumentUploaded>0</IsDocumentUploaded><DocumentIssueDate xsi:nil="true" /><IsCompulsory>0</IsCompulsory><IsVerified>1</IsVerified><VerificationStatus>Y</VerificationStatus><VerificationComments /><IsAllCompulsoryDocumentsUploaded>0</IsAllCompulsoryDocumentsUploaded></RequiredDocumentEntity><RequiredDocumentEntity><CandidateID>0</CandidateID><DocumentID>5</DocumentID><IsDocumentUploaded>0</IsDocumentUploaded><DocumentIssueDate xsi:nil="true" /><IsCompulsory>0</IsCompulsory><IsVerified>1</IsVerified><VerificationStatus>Y</VerificationStatus><VerificationComments /><IsAllCompulsoryDocumentsUploaded>0</IsAllCompulsoryDocumentsUploaded></RequiredDocumentEntity><RequiredDocumentEntity><CandidateID>0</CandidateID><DocumentID>43</DocumentID><IsDocumentUploaded>0</IsDocumentUploaded><DocumentIssueDate xsi:nil="true" /><IsCompulsory>0</IsCompulsory><IsVerified>1</IsVerified><VerificationStatus>Y</VerificationStatus><VerificationComments /><IsAllCompulsoryDocumentsUploaded>0</IsAllCompulsoryDocumentsUploaded></RequiredDocumentEntity><RequiredDocumentEntity><CandidateID>0</CandidateID><DocumentID>6</DocumentID><IsDocumentUploaded>0</IsDocumentUploaded><DocumentIssueDate xsi:nil="true" /><IsCompulsory>0</IsCompulsory><IsVerified>1</IsVerified><VerificationStatus>Y</VerificationStatus><VerificationComments /><IsAllCompulsoryDocumentsUploaded>0</IsAllCompulsoryDocumentsUploaded></RequiredDocumentEntity><RequiredDocumentEntity><CandidateID>0</CandidateID><DocumentID>27</DocumentID><IsDocumentUploaded>0</IsDocumentUploaded><DocumentIssueDate xsi:nil="true" /><IsCompulsory>0</IsCompulsory><IsVerified>1</IsVerified><VerificationStatus>Y</VerificationStatus><VerificationComments /><IsAllCompulsoryDocumentsUploaded>0</IsAllCompulsoryDocumentsUploaded></RequiredDocumentEntity><RequiredDocumentEntity><CandidateID>0</CandidateID><DocumentID>19</DocumentID><IsDocumentUploaded>0</IsDocumentUploaded><DocumentIssueDate xsi:nil="true" /><IsCompulsory>0</IsCompulsory><IsVerified>1</IsVerified><VerificationStatus>Y</VerificationStatus><VerificationComments /><IsAllCompulsoryDocumentsUploaded>0</IsAllCompulsoryDocumentsUploaded></RequiredDocumentEntity><RequiredDocumentEntity><CandidateID>0</CandidateID><DocumentID>20</DocumentID><IsDocumentUploaded>0</IsDocumentUploaded><DocumentIssueDate xsi:nil="true" /><IsCompulsory>0</IsCompulsory><IsVerified>1</IsVerified><VerificationStatus>Y</VerificationStatus><VerificationComments /><IsAllCompulsoryDocumentsUploaded>0</IsAllCompulsoryDocumentsUploaded></RequiredDocumentEntity></ArrayOfRequiredDocumentEntity>','EVC10001',':1'

 @CandidateID BIGINT,    
 @DocumentsVerifiedXML XML,    
 @UserLoginID VARCHAR(50),    
 @IPAddress VARCHAR(50)    
AS 
SET NOCOUNT ON 
BEGIN    
DECLARE 
	@UserTypeID INT = 0,
    @AssignToUser VARCHAR(50) = '',
	@IsDone VARCHAR(500) = 'N',
	@IsInnerProcOk BIT = 0,
	@WeightageCount SMALLINT = 0,
	@WeightageID	SMALLINT = 0,
	@DocID	SMALLINT = 0

    
    BEGIN TRY       
        IF NOT EXISTS (SELECT 1 
                       FROM College_AllotmentDetails (NOLOCK) 
                       WHERE CandidateID = @CandidateID 
                         AND ReportingStatus = 'Y')    
        BEGIN    
            BEGIN TRANSACTION;
    
            -- Update ApplicationForm_DocumentDetails
            UPDATE ApplicationForm_DocumentDetails     
            SET    
                IsVerified            = Item.value('(IsVerified/text())[1]', 'BIT'),    
                VerificationStatus     = Item.value('(VerificationStatus/text())[1]', 'CHAR(1)'),    
                VerificationComments   = ISNULL(Item.value('(VerificationComments/text())[1]', 'VARCHAR(250)'), ''),    
                VerifiedDateTime       = [dbo].[fnGetISTDateTime](),    
                VerifiedBy             = @UserLoginID,    
                VerifiedByIPAddress    = @IPAddress    
            FROM     
                @DocumentsVerifiedXML.nodes('/ArrayOfRequiredDocumentEntity/RequiredDocumentEntity') AS TEMPTABLE(Item)    
            WHERE    
                CandidateID = @CandidateID 
                AND DocumentID = Item.value('(DocumentID/text())[1]', 'INT');
    
            -- Insert into ApplicationForm_DocumentDetails_History
            INSERT INTO ApplicationForm_DocumentDetails_History (CandidateID, DocumentID, DocumentGroup, IsDocumentUploaded, 
                DocumentUploadedURL, DocumentNo, DocumentIssueDate, DocumentUploadedDateTime, DocumentUploadedBy, 
                DocumentUploadedByIPAddress, IsVerified, VerificationStatus, VerificationComments, VerifiedDateTime, 
                VerifiedBy, VerifiedByIPAddress, Action, ModifiedDateTime, ModifiedBy, ModifiedByIPAddress)    
            SELECT 
                CandidateID, DocumentID, DocumentGroup, IsDocumentUploaded, DocumentUploadedURL, DocumentNo, 
                DocumentIssueDate, DocumentUploadedDateTime, DocumentUploadedBy, DocumentUploadedByIPAddress, 
                IsVerified, VerificationStatus, VerificationComments, VerifiedDateTime, VerifiedBy, VerifiedByIPAddress, 
                'U', [dbo].[fnGetISTDateTime](), @UserLoginID, @IPAddress 
            FROM 
                ApplicationForm_DocumentDetails (NOLOCK) 
            WHERE 
                CandidateID = @CandidateID;
       
            -- Update ApplicationForm_Status
            IF NOT EXISTS (SELECT 1 
                           FROM ApplicationForm_DocumentDetails (NOLOCK) A 
                           INNER JOIN Master_Document (NOLOCK) B ON A.DocumentID = B.DocumentID 
                           WHERE CandidateID = @CandidateID 
                             AND (A.VerificationStatus = 'N' OR A.VerificationStatus = 'H') 
                             AND B.IsCompulsory = 1)    
            BEGIN    
                UPDATE ApplicationForm_Status 
                SET IsFullyEVerified = 1 
                WHERE CandidateID = @CandidateID;    
            END     
            ELSE    
            BEGIN    
                UPDATE ApplicationForm_Status 
                SET IsFullyEVerified = 0 
                WHERE CandidateID = @CandidateID;    
            END;     
      
            -- Insert into ApplicationForm_Status_History
            INSERT INTO ApplicationForm_Status_History (CandidateID, VersionNo, StepID, FormStatus, LastModifiedOn, 
                LastModifiedBy, LastModifiedByIPAddress, LastModifiedPage, IsFullyEVerified)    
            SELECT 
                CandidateID, VersionNo, StepID, FormStatus, LastModifiedOn, LastModifiedBy, LastModifiedByIPAddress, 
                LastModifiedPage, IsFullyEVerified 
            FROM 
                ApplicationForm_Status (NOLOCK) 
            WHERE 
                CandidateID = @CandidateID;
    
            -- Insert into ApplicationForm_EVerificationDetails
            INSERT INTO ApplicationForm_EVerificationDetails (CandidateID, EVerifiedDateTime, EVerifiedBy, EVerifiedByIPAddress)    
            VALUES (@CandidateID, [dbo].[fnGetISTDateTime](), @UserLoginID, @IPAddress);      

			DECLARE @MyWeightageTbl TABLE
				(WeightageID	INT)
            ---------------------     
            -- Save Weightage   
            IF EXISTS (SELECT Item.value('(DocumentID/text())[1]', 'INT') 
                       FROM @DocumentsVerifiedXML.nodes('/ArrayOfRequiredDocumentEntity/RequiredDocumentEntity') AS TEMPTABLE(Item)   
                       WHERE Item.value('(DocumentID/text())[1]', 'INT') IN (SELECT DocumentID FROM Master_Weightage))  
            BEGIN   
				--SET @WeightageCount = 0
				--SELECT @WeightageCount = COUNT(Item.value('(DocumentID/text())[1]', 'INT')) 
    --                   FROM @DocumentsVerifiedXML.nodes('/ArrayOfRequiredDocumentEntity/RequiredDocumentEntity') AS TEMPTABLE(Item)   
    --                   WHERE Item.value('(DocumentID/text())[1]', 'INT') IN (SELECT DocumentID FROM Master_Weightage)
				--PRINT  @WeightageCount

				INSERT INTO @MyWeightageTbl
				SELECT Item.value('(DocumentID/text())[1]', 'INT') 
                       FROM @DocumentsVerifiedXML.nodes('/ArrayOfRequiredDocumentEntity/RequiredDocumentEntity') AS TEMPTABLE(Item)   
                       WHERE Item.value('(DocumentID/text())[1]', 'INT') IN (SELECT DocumentID FROM Master_Weightage)

				WHILE EXISTS (SELECT 1 FROM @MyWeightageTbl)
                BEGIN
					SET @WeightageID = 0
					SET @DocID	= 0
					SELECT TOP 1 @DocID = WeightageID FROM @MyWeightageTbl
					SELECT @WeightageID = WeightageID FROM Master_Weightage WHERE DocumentID = @DocID
					EXEC ApplicationForm_SaveWeightage @CandidateID, @UserLoginID, @IPAddress, @WeightageID, @IsInnerProcOk OUTPUT;  

					DELETE FROM @MyWeightageTbl WHERE WeightageID = @DocID
				END
                IF (@IsInnerProcOk = 1)  
                BEGIN   
                    COMMIT TRANSACTION;
                    SET @IsDone = 'Y';    
                END;
				ELSE
				BEGIN 
					 ROLLBACK TRANSACTION;
					SET @IsDone = 'N';    
				END 
            END   
            ELSE  
            BEGIN   
                COMMIT TRANSACTION;    
                SET @IsDone = 'Y';    
            END;   
            ---------------------     
        END    
        ELSE    
        BEGIN    
            SET @IsDone = 'This Candidate is Already Admitted.';    
        END;    
    END TRY    
    BEGIN CATCH      
        IF (@@TRANCOUNT > 0)    
            ROLLBACK TRANSACTION;    
         
        SET @IsDone = 'N';    
          
        INSERT INTO Log_ErrorDetails(LogSource, ErrorMessage, LogDate, UserLoginID)    
        VALUES(ERROR_PROCEDURE(), ERROR_MESSAGE() + ' AT ' + CAST(ERROR_LINE() AS VARCHAR(10)) + ' For Form No '  + CAST(@CandidateID AS VARCHAR(20)), [dbo].[fnGetISTDateTime](), @UserLoginID);     
    END CATCH;    
    
    SELECT @IsDone AS IsOk;    
END;

