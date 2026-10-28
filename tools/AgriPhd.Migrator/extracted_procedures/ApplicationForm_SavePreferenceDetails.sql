CREATE   PROCEDURE [dbo].[ApplicationForm_SavePreferenceDetails]
	@CandidateID BIGINT,
	@OptionsXML XML,
	@UserLoginID VARCHAR(50),  
	@IPAddress VARCHAR(50),      
	@PageCode VARCHAR(50)
AS
	DECLARE @IsEligible	BIT = 0
	DECLARE @ErrMsg	VARCHAR(250) = ''
	DECLARE @IsInnerProcOk BIT = 0
	DECLARE @IsDone	VARCHAR(500) = 'N'

	BEGIN TRY

		SELECT @IsEligible = ISNULL(IsEligible, 0), @ErrMsg = ErrMsg FROM dbo.fnCheckApplicationFormFillingEligiblity(@CandidateID, @UserLoginID)
		
		IF (@IsEligible = 1)
			BEGIN
				BEGIN TRAN

				UPDATE 
					ApplicationForm_AppliedCollegeDetails
				SET
					PreferenceNo		= Item.value('(PreferenceNo/text())[1]', 'BIGINT'),
					ModifiedDateTime	= dbo.fnGetISTDateTime(),
					ModifiedBy			= @UserLoginID,
					ModifiedByIPAddress = @IPAddress
				FROM 
					@OptionsXML.nodes('/ArrayOfOptionEntity/OptionEntity') AS Tbl(Item)
				WHERE 
					CandidateID = @CandidateID AND CollegeID = Item.value('(CollegeID/text())[1]', 'BIGINT')

				INSERT INTO ApplicationForm_AppliedCollegeDetails_History (CandidateID, AppliedColleges, Flag, ModifiedDateTime, ModifiedBy, ModifiedByIPAddress)
				SELECT @CandidateID, (SELECT PreferenceNo, CollegeID FROM ApplicationForm_AppliedCollegeDetails (NOLOCK) WHERE CandidateID = @CandidateID AND CollegeID IN (SELECT Item.value('(CollegeID/text())[1]', 'BIGINT') FROM @OptionsXML.nodes('/ArrayOfOptionEntity/OptionEntity') AS Tbl(Item)) FOR JSON PATH), 'UPDATE', dbo.fnGetISTDateTime(), @UserLoginID, @IPAddress
				
				EXEC ApplicationForm_UpdateStatus @CandidateID, @UserLoginID, @PageCode, @IPAddress, @IsInnerProcOk OUTPUT
	
				IF (@IsInnerProcOk = 1)
					BEGIN						
						COMMIT TRAN
						SET @IsDone = 'Y'
					END 
				ELSE
					BEGIN
						ROLLBACK TRAN
						SET @IsDone = 'N'
					END
			END 
		ELSE
			BEGIN
				SET @IsDone = @ErrMsg
			END
	END TRY
	BEGIN CATCH
		IF(@@TRANCOUNT > 0)
			ROLLBACK TRAN
			
		SET @IsDone = 'N'
		 
		INSERT INTO Log_ErrorDetails(LogSource, ErrorMessage, LogDate, UserLoginID)
		VALUES(ERROR_PROCEDURE(), ERROR_MESSAGE(), dbo.fnGetISTDateTime(), @UserLoginID) 
	END CATCH
 
	SELECT @IsDone AS IsOk

